## Autenticación: JWT (implementación básica de login y registro)

En la prueba tecnica he decidido usar la librería `jsonwebtoken` usando el algoritmo HS256 para generar tokens JWT. Para la clave secreta, he utilizado el siguiente comando para generar una cadena aleatoria segura:

```bash
openssl rand -base64 32
```

La clave secreta generada se almacena en una variable de entorno llamada `JWT_SECRET`.
