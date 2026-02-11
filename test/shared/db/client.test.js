import mongoose from 'mongoose';

import { connectDB, gracefulShutdown } from '../../../src/shared/db/client.js';

jest.mock('mongoose');

describe('connectDB', () => {
  const originalEnv = process.env;
  let mockConnection;
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let processExitSpy;
  let errorHandler;
  let disconnectedHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';

    mockConnection = {
      connection: {
        host: 'localhost:27017',
      },
    };

    errorHandler = null;
    disconnectedHandler = null;

    mongoose.connection = {
      on: jest.fn((event, handler) => {
        if (event === 'error') errorHandler = handler;
        if (event === 'disconnected') disconnectedHandler = handler;
      }),
    };

    mongoose.connect = jest.fn().mockResolvedValue(mockConnection);

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('should connect to MongoDB successfully with correct options', async () => {
    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/test',
      {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'MongoDB connected: localhost:27017'
    );
  });

  it('should set up error event handler', async () => {
    await connectDB();

    expect(mongoose.connection.on).toHaveBeenCalledWith(
      'error',
      expect.any(Function)
    );
  });

  it('should set up disconnected event handler', async () => {
    await connectDB();

    expect(mongoose.connection.on).toHaveBeenCalledWith(
      'disconnected',
      expect.any(Function)
    );
  });

  it('should log error when error event is triggered', async () => {
    await connectDB();

    const testError = new Error('Connection error');
    errorHandler(testError);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in MongoDB connection:',
      testError
    );
  });

  it('should log warning when disconnected event is triggered', async () => {
    await connectDB();

    disconnectedHandler();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'MongoDB disconnected. Attempting to reconnect...'
    );
  });

  it('should exit process when connection fails', async () => {
    const connectionError = new Error('Connection failed');
    mongoose.connect.mockRejectedValue(connectionError);

    await connectDB();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Critical error connecting to MongoDB:',
      'Connection failed'
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle connection with different host', async () => {
    process.env.MONGO_URI = 'mongodb://remotehost:27017/production';
    mockConnection.connection.host = 'remotehost:27017';

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://remotehost:27017/production',
      expect.any(Object)
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'MongoDB connected: remotehost:27017'
    );
  });

  it('should handle error without message', async () => {
    const connectionError = {};
    mongoose.connect.mockRejectedValue(connectionError);

    await connectDB();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Critical error connecting to MongoDB:',
      undefined
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should register both event handlers', async () => {
    await connectDB();

    expect(mongoose.connection.on).toHaveBeenCalledTimes(2);
    expect(mongoose.connection.on).toHaveBeenNthCalledWith(
      1,
      'error',
      expect.any(Function)
    );
    expect(mongoose.connection.on).toHaveBeenNthCalledWith(
      2,
      'disconnected',
      expect.any(Function)
    );
  });
});

describe('gracefulShutdown', () => {
  let mockServer;
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;
  let serverCloseCallback;

  beforeEach(() => {
    jest.clearAllMocks();

    serverCloseCallback = null;
    mockServer = {
      close: jest.fn((callback) => {
        serverCloseCallback = callback;
      }),
    };

    mongoose.connection = {
      close: jest.fn().mockResolvedValue(),
    };

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('should handle SIGTERM signal and shutdown gracefully', async () => {
    gracefulShutdown('SIGTERM', mockServer);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '\nSIGTERM received. Starting graceful shutdown...'
    );
    expect(mockServer.close).toHaveBeenCalled();

    await serverCloseCallback();

    expect(consoleLogSpy).toHaveBeenCalledWith('HTTP server closed.');
    expect(mongoose.connection.close).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith('MongoDB connection closed.');
    expect(processExitSpy).toHaveBeenCalledWith(0);
  });

  it('should handle SIGINT signal and shutdown gracefully', async () => {
    gracefulShutdown('SIGINT', mockServer);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '\nSIGINT received. Starting graceful shutdown...'
    );

    await serverCloseCallback();

    expect(processExitSpy).toHaveBeenCalledWith(0);
  });

  it('should exit with error code when MongoDB close fails', async () => {
    const closeError = new Error('Failed to close MongoDB');
    mongoose.connection.close.mockRejectedValue(closeError);

    gracefulShutdown('SIGTERM', mockServer);
    await serverCloseCallback();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error closing MongoDB:',
      closeError
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should close server before closing MongoDB', async () => {
    const executionOrder = [];

    mockServer.close.mockImplementation((callback) => {
      executionOrder.push('server-close-called');
      serverCloseCallback = callback;
    });

    mongoose.connection.close.mockImplementation(() => {
      executionOrder.push('mongodb-close-called');
      return Promise.resolve();
    });

    gracefulShutdown('SIGTERM', mockServer);
    await serverCloseCallback();

    expect(executionOrder).toEqual([
      'server-close-called',
      'mongodb-close-called',
    ]);
  });

  it('should handle custom signal names', async () => {
    gracefulShutdown('CUSTOM_SIGNAL', mockServer);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '\nCUSTOM_SIGNAL received. Starting graceful shutdown...'
    );

    await serverCloseCallback();

    expect(processExitSpy).toHaveBeenCalledWith(0);
  });

  it('should log all steps during successful shutdown', async () => {
    gracefulShutdown('SIGTERM', mockServer);
    await serverCloseCallback();

    expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      1,
      '\nSIGTERM received. Starting graceful shutdown...'
    );
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'HTTP server closed.');
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      3,
      'MongoDB connection closed.'
    );
  });

  it('should not exit before server close callback is executed', () => {
    gracefulShutdown('SIGTERM', mockServer);

    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it('should handle MongoDB close with network error', async () => {
    const networkError = new Error('Network timeout');
    networkError.code = 'ETIMEDOUT';
    mongoose.connection.close.mockRejectedValue(networkError);

    gracefulShutdown('SIGTERM', mockServer);
    await serverCloseCallback();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error closing MongoDB:',
      networkError
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle multiple shutdown signals correctly', async () => {
    gracefulShutdown('SIGTERM', mockServer);
    const firstCallback = serverCloseCallback;

    gracefulShutdown('SIGINT', mockServer);
    const secondCallback = serverCloseCallback;

    await firstCallback();
    await secondCallback();

    expect(mongoose.connection.close).toHaveBeenCalledTimes(2);
    expect(processExitSpy).toHaveBeenCalledTimes(2);
  });
});
