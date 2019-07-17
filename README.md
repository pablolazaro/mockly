[![CircleCI](https://circleci.com/gh/pablolazaro/mockly.svg?style=svg&circle-token=3e0293b00e6875dbf3f4e82f976708e75e35b556)](https://circleci.com/gh/pablolazaro/mockly)

# Mockly

**Mockly** es un servidor de _mocks_ o datos ficticios que busca optimizar y agilizar los desarrollos de las aplicaciones Front End rompiendo la dependencia entre la aplicación Front End a desarrollar y los servicios HTTP que consuma. Puedes utilizar **Mockly** para simular tu capa de Back End y tener disponible rápidamente los servicios que necesites devolviendo datos ficticios. Serás más rápido en tus desarrollos al no depender de la disponibilidad y el estado de tu plataforma de Back End. **Mockly** está pensado para soportar servicios que den cobertura a un _API RESTful_ pero existen mecanismos para hacerlo funcionar también si tu aplicación no sigue al 100% el estándar REST.

## Mockly CLI

La _CLI_ es la forma más rápida de utilizar **Mockly**. Instálala de esta forma:

Globalmente si lo utilizas en varios proyectos o no quieres depender de un proyecto NPM:

```
npm i -g @mockly/cli
```

O en un proyecto NPM específico:

```
npm i --save-dev @mockly/cli
```

## Crear un recurso

El principio de un API RESTful es la existencia de recursos que pueden ser manipulados a través de una interfaz HTTP.

**Mockly** está diseñado originalmente para simular servicios que nos permitan modificar los recursos REST que necesitemos. Por lo tanto, lo primero que debemos hacer
es definir cuales son nuestros recursos. Para ello, necesitamos crear un fichero `{name}.resource.json` con la información del recurso: nombre de la colección del recurso y los recursos iniciales que queremos que tenga.

Para definir el recurso de `Cars bastaría con crear un fichero `cars.resource.json` con la siguiente estructura:

```
{
  "cars": [
    {
      "id:" "FIJSD8QH"
      "color": "black"
    },
    {
      "id:" "IO19823H"
      "color": "red"
    },
    {
      "id:" "12UH38D"
      "color": "blue"
    }
  ]
}
```

Es importante tener en cuenta que el nombre de la propiedad da nombre a la colección del recurso y que los endpoints generados estarán basados en este nombre. En este caso, se estaría creando el recurso `Cars` con los elementos definidos dentro del array.

> Es aconsejable tener una única colección por fichero, aunque es posible definir más de una colección en un mismo fichero JSON

Si arrancamos el servidor ejecutando `mockly start` y visitamos el navegador en la URL `http://localhost:3000/cars` veremos que devuelve los datos definidos.

Automáticamente **Mockly** genera los endpoints necesarios para manipular las colecciones de recursos definidas:

Sobre el endpoint `/cars` tendremos disponibles las siguientes operaciones HTTP:

* `GET`  - Para obtener todos los recursos de la colección
* `POST` - Para crear un nuevo recurso en la colección

Sobre un recurso ya existente (`/cars/:id`):

* `GET` - Obtiene el recurso
* `PUT` / `PATCH` Modifica parcial o totalmente el recurso
* `DELETE` - Elimina el recurso


## Configuración de Mockly

Puedes configurar parámetros generales de la herramienta utilizando el fichero `.mocklyrc`. Este fichero de configuración
tiene una estructura que puedes validar utilizando el JSON Schema proporcionado en el paquete (ver ejemplo).

Las opciones son:

| Nombre        | Tipo de valor         | Valor por defecto  | Descripción
| ------------- |:-------------:| -----:| -------:|
| delay      | integer | 0 |  Añade un delay a todas las peticiones |
| port      | integer      |   3000 | Puerto donde se levanta el servidor de Mockly |
| prefix | string     |    `null`  | Prefijo utilizando para todos los recursos |
| resourceFilesGlob | string | `**/*.resource.json` | Glob utilizado para obtener los ficheros de recursos |
|  rewritesFilesGlob | string | `**/*.rewrites.json` | Glob utilizado para obtener los ficheros de reescritura |

Un ejemplo de configuración sería el siguiente: 

```
{
    "schema": "node_modules/@mockly/tools/schemas/configuration.schema.json",
    "delay": 700,
    "port": 3001,
    "prefix": "/api/v1",
    "resourceFilesGlob": "**/*.recursos.json",
    "rewritesFilesGlob": "**/*.rewrites.json"
}
```


## Configuración de respuestas

Por defecto, **Mockly** utiliza una [base de datos interna](https://pouchdb.com) para almacenar las colecciones de 
recursos definidas e ir almacenando las manipulaciones que se hagan sobre éstos. Por lo tanto, las respuestas de los 
métodos HTTP expuestos son la representación real de los recursos en la base de datos.

Para ser flexible con los comportamientos y poder cubrir el máximo número de casuísticas la herramienta permite realizar
configuraciones sobre como queremos que se comporte una petición en concreto. Por ejemplo, forzar que una petición devuelva
un error o un código 401, que devuelva cabeceras adicionales o provocar que la respuesta tarde más de lo habitual.

Lo primero que debemos hacer para configurar las respuestas es crear el fichero de configuración. Este fichero JSON tiene
una estructura establecida y se debe seguir adecuadamente para que el comportamiento sea el adecuado. 

> Hemos preparado un JSON Schema que te servirá de guía a la hora de rellenar tus configuraciones

El fichero JSON debe contener una key con el nombre `respuestas` y un array de configuraciones de respuestas.
Cada configuración debe tener las siguientes propiedades obligatorias:

* `path` es la URI de la petición que queremos configurar
* `method` es el método HTTP de la petición que queremos configurar

Estas dos propiedades nos sirven para realizar el *match* de la ruta que estamos configurando. Además podemos configurar
los siguientes parámetros:

* `body` es el cuerpo de la respuesta
* `cookies` son las cookies que queremos que guarde la respuesta
* `delay` es el tiempo que queremos que tarde la petición
* `headers` son las cabeceras que queremos que devuelva la petición
* `status` es el código de estado HTTP que queremos que devuelva la petición

Un ejemplo sería este:

```
{
    "$schema": "node_modules/@mockly/tools/schemas/response-configuration.schema.json",
    "responses": [
        {
            "path": "/cars",
            "method": "POST",
            "status": 500,
            "body": "Service unavailable"
        }
    ]
}
```
