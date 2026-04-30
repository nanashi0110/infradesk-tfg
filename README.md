# InfraDesk

InfraDesk es una aplicacion web diseñada para centralizar la gestion de tareas de mantenimiento tecnico y el almacenamiento seguro de credenciales para administradores de sistemas.

A continuacion se detallan las instrucciones para desplegar la aplicacion en entornos locales clonando el repositorio publico. El despliegue se basa en la tecnologia de contenedores Docker, por lo que no es necesario instalar manualmente Node.js o MongoDB en la maquina host.

---

## 1. Despliegue en sistemas Linux

Este procedimiento se ha probado en distribuciones basadas en Debian (Ubuntu) y RHEL.

### Requisitos de software

Es necesario tener instalados los siguientes paquetes antes de proceder:

1.  **Git**: Para clonar el repositorio.
2.  **Docker Engine**: Version 20.10.0 o superior.
3.  **Docker Compose**: Version 1.29.0 o superior.

Asegurese de que su usuario pertenece al grupo `docker` para ejecutar comandos sin `sudo`.

### Pasos para el despliegue (Linux)

Abra una terminal y ejecute los siguientes comandos:

1.  **Clonar el repositorio**:
    ```bash
    git clone [https://github.com/nanashi0110/infradesk-tfg.git](https://github.com/nanashi0110/infradesk-tfg.git)
    ```

2.  **Acceder al directorio del proyecto**:
    ```bash
    cd infradesk-tfg
    ```

3.  **Configuracion de variables de entorno (Opcional)**:
    El proyecto incluye archivos `.env.example` en las carpetas `backend` y `frontend`. Para una ejecucion estandar local, el archivo `docker-compose.yml` ya incorpora valores por defecto funcionales. Si desea cambiarlos, cree archivos `.env` correspondientes basandose en los ejemplos.

4.  **Levantar los contenedores con Docker Compose**:
    Este comando descargara las imagenes necesarias, construira los contenedores del frontend y backend, y levantara la base de datos MongoDB.
    ```bash
    docker-compose up -d --build
    ```
    *Nota: La bandera `-d` ejecuta los contenedores en segundo plano y `--build` asegura que se construyan las imagenes locales.*

5.  **Verificar el estado**:
    Compruebe que los tres contenedores (frontend, backend, database) estan en estado "Up".
    ```bash
    docker ps
    ```

6.  **Acceso a la aplicacion**:
    Una vez que los contenedores esten corriendo, puede acceder a la interfaz web a traves de:
    *   URL: `http://localhost:5173`

### Detencion del servicio (Linux)

Para detener y borrar los contenedores manteniendo los datos de la base de datos (si se han configurado volumenes), ejecute:
```bash
docker-compose down



## Despliegue en sistemas Windows

Este procedimiento requiere el uso de Docker Desktop, habilitar virtualización desde la BIOS y el uso del backend de WSL 2 (Windows Subsystem for Linux).

### Requisitos de software

Es necesario instalar y configurar lo siguiente:

1.  **Git para Windows**: Instale Git conservando las opciones por defecto para la linea de comandos.
2.  **WSL 2 **
3.  **Docker Desktop**: Descargue e instale Docker Desktop. Durante la instalacion, asegurese de activar la opcion para usar el backend de WSL 2.

### Pasos para el despliegue (Windows)

Puede utilizar Git Bash, Command Prompt (cmd) o PowerShell.

1.  **Clonar el repositorio**:
    Abra su terminal y clone el proyecto en una carpeta local
    ```cmd
    git clone [https://github.com/nanashi0110/infradesk-tfg.git](https://github.com/nanashi0110/infradesk-tfg.git)
    ```

2.  **Acceder al directorio del proyecto**:
    ```cmd
    cd infradesk-tfg
    ```

3.  **Asegurar que Docker Desktop esta ejecutandose**:
    Inicie Docker Desktop desde el menu Inicio y espere a que el icono en la barra de tareas indique que esta "running" (verde).

4.  **Levantar los contenedores con Docker Compose**:
    Ejecute el siguiente comando en la terminal dentro de la carpeta del proyecto:
    ```cmd
    docker compose up -d --build
    ```
    *Nota: En versiones modernas de Docker Desktop se usa `docker compose` (sin guion).*

5.  **Verificar el estado**:
    Puede comprobarlo en la terminal con `docker ps` o visualmente en la interfaz grafica de Docker Desktop en la seccion "Containers". Deberia ver el grupo "infradesk-tfg" con tres contenedores activos.

6.  **Acceso a la aplicacion**:
    Abra un navegador web y acceda a:
    *   URL: `http://localhost:5173`

### Detencion del servicio (Windows)

Para detener los contenedores, puede usar la interfaz grafica de Docker Desktop (boton Stop) o ejecutar en la terminal desde la carpeta del proyecto:
```cmd
docker compose down
