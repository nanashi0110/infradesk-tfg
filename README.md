# InfraDesk

InfraDesk es una aplicación web diseñada para centralizar la gestión de tareas de mantenimiento técnico y el almacenamiento seguro de credenciales para administradores de sistemas.

A continuación se detallan las instrucciones para desplegar la aplicación en entornos locales clonando el repositorio público. El despliegue se basa en la tecnología de contenedores Docker, por lo que no es necesario instalar manualmente Node.js o MongoDB en la máquina host.

---

## Despliegue

- [Linux](#despliegue-en-sistemas-linux)
- [Windows](#despliegue-en-sistemas-windows)

---

## Despliegue en sistemas Linux

Este procedimiento se ha probado en distribuciones basadas en Debian.

### Requisitos

- Git  
- Docker Engine (≥ 20.10.0)  
- Docker Compose (≥ 1.29.0)  

Asegúrese de que su usuario pertenece al grupo `docker` para evitar usar `sudo`.

### Instalación

```bash
git clone https://github.com/nanashi0110/infradesk-tfg
cd infradesk-tfg
```

### Ejecución

```bash
docker-compose up -d --build
```

- `-d`: modo segundo plano  
- `--build`: fuerza la construcción de imágenes  

### Verificación

```bash
docker ps
```

Debe ver 3 contenedores activos:

- frontend  
- backend  
- database  

### Acceso

http://localhost:5173

http://localhost:5173/registro-inicial

### Detener

```bash
docker-compose down
```

---

## Despliegue en sistemas Windows

### Requisitos

- Git  
- WSL 2  
- Docker Desktop (con backend WSL 2 activado)  

### Instalación

```cmd
git clone https://github.com/nanashi0110/infradesk-tfg
cd infradesk-tfg
```

### Ejecución

Asegúrese de que Docker Desktop está en ejecución.

```cmd
docker-compose up -d --build
```

### Verificación

```cmd
docker ps
```

O desde Docker Desktop en la sección "Containers".

### Acceso

http://localhost:5173

http://localhost:5173/registro-inicial

### Detener

```cmd
docker compose down
```

---

## Notas

- No es necesario instalar Node.js ni MongoDB manualmente.  
- Todo el entorno se ejecuta mediante contenedores Docker.  
- Compatible con Linux y Windows usando WSL 2.  

---

## Autor

Proyecto desarrollado como TFG por Miguel Angel Gragera.
