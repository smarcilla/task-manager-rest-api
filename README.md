### Tareas Pendientes

//TODO: Integrar la app dentro de docker con docker-compose, incluyendo la base de datos MongoDB.

//TODO: Agregar Swagger

//TODO: Documentar el README.md

//TODO: Añadir unit tests (ver donde). Usamos la libreria de mutation Stryker

## Autenticación: JWT (implementación básica de login y registro)

En la prueba tecnica he decidido usar la librería `jsonwebtoken` usando el algoritmo HS256 para generar tokens JWT. Para la clave secreta, he utilizado el siguiente comando para generar una cadena aleatoria segura:

```bash
openssl rand -base64 32
```

La clave secreta generada se almacena en una variable de entorno llamada `JWT_SECRET`.
