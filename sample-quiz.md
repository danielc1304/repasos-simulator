# Google Cloud Associate Cloud Engineer - Repaso

Preguntas de repaso para la certificación. Cubre Compute Engine, IAM, VPC, Cloud Storage, Cloud SQL, Monitoring/Logging.

## Question 1 (multiple_choice)
**Q:** ¿Cuál es el alcance de una regla de firewall VPC en Google Cloud?
**Options:**
- Global (se aplica a todo el proyecto) ✓
- Regional (solo una región específica)
- Zonal (solo una zona específica)
- Por instancia (solo la VM objetivo)
**Explanation:** Las reglas de firewall VPC son recursos globales del proyecto. Se aplican a todas las instancias que coincidan con la etiqueta de destino y el rango de origen, independientemente de la región o zona.
**Points:** 1

## Question 2 (multiple_choice)
**Q:** ¿Qué tipo de disco persistente ofrece el mejor rendimiento IOPS para cargas de trabajo de base de datos?
**Options:**
- Standard Persistent Disk (HDD)
- Balanced Persistent Disk
- SSD Persistent Disk
- Local SSD ✓
**Explanation:** Local SSD ofrece el mayor rendimiento IOPS y menor latencia, pero es efímero (se pierde al detener la instancia). Para bases de datos persistentes con alto rendimiento, SSD Persistent Disk es la mejor opción balanceada.
**Points:** 1

## Question 3 (multiple_select)
**Q:** Selecciona los roles predefinidos de IAM que siguen el principio de menor privilegio para un desarrollador que necesita desplegar servicios en Cloud Run y ver logs:
**Options:**
- roles/run.developer ✓
- roles/logging.viewer ✓
- roles/owner
- roles/editor
**Explanation:** roles/run.developer permite desplegar y gestionar servicios Cloud Run. roles/logging.viewer permite ver logs. Owner y Editor son roles básicos muy permisivos que violan el menor privilegio.
**Points:** 2

## Question 4 (multiple_choice)
**Q:** ¿Cuál es la clase de almacenamiento más económica para datos de archivo que se acceden menos de una vez al año?
**Options:**
- Standard Storage
- Nearline Storage
- Coldline Storage
- Archive Storage ✓
**Explanation:** Archive Storage es la más barata para datos de acceso muy infrequente (≤1 vez/año). Tiene mayor latencia de acceso (horas) y cargo mínimo de 365 días. Coldline es para acceso ≤1 vez/trimestre (90 días mínimo). Nearline ≤1 vez/mes (30 días mínimo).
**Points:** 1

## Question 5 (open_ended)
**Q:** Explica la diferencia entre una VPC en modo automático y una VPC en modo personalizado.
**Keywords:** automático, subredes, regiones, personalizado, control, rangos IP, creación manual
**Explanation:** VPC automática: crea una subred en cada región automáticamente con rangos IP predefinidos (10.128.0.0/9). Simple pero menos control. VPC personalizada: tú defines subredes, regiones y rangos CIDR manualmente. Recomendada para producción por control total sobre el direccionamiento.
**Points:** 2

## Question 6 (multiple_choice)
**Q:** ¿Qué servicio de Google Cloud usarías para ejecutar contenedores sin gestionar infraestructura, con escalado automático a cero?
**Options:**
- Google Kubernetes Engine (GKE)
- Cloud Run ✓
- Compute Engine con contenedores
- Cloud Functions (2nd gen)
**Explanation:** Cloud Run es serverless containers: subes tu imagen, se escala automáticamente (incluyendo a 0), solo pagas por uso. GKE requiere gestionar clúster. Compute Engine requiere gestionar VMs. Cloud Functions 2da gen usa Cloud Run por debajo pero para funciones, no contenedores arbitrarios.
**Points:** 1

## Question 7 (multiple_select)
**Q:** ¿Cuáles de las siguientes son características de Cloud SQL (PostgreSQL/MySQL/SQL Server)?
**Options:**
- Backups automáticos y point-in-time recovery ✓
- Alta disponibilidad con failover automático (regional) ✓
- Escalado horizontal de escritura (sharding) nativo
- Cifrado en reposo y en tránsito por defecto ✓
- Replicación de lectura (read replicas) ✓
**Explanation:** Cloud SQL ofrece: backups automáticos + PITR, HA regional con failover automático, cifrado por defecto, read replicas. NO tiene sharding horizontal nativo (eso sería Cloud Spanner o Vitess).
**Points:** 2

## Question 8 (open_ended)
**Q:** Describe los pasos para configurar un balanceador de carga HTTP(S) global con Cloud CDN para una aplicación en Cloud Run.
**Keywords:** balanceador de carga, HTTP(S), global, backend, Cloud Run, Cloud CDN, certificado SSL, mapa de URL, proxy
**Explanation:** 1) Crear servicio Cloud Run (permite tráfico no autenticado). 2) Crear balanceador de carga HTTP(S) global. 3) Configurar backend service apuntando al servicio Cloud Run (NEG serverless). 4) Habilitar Cloud CDN en el backend. 5) Configurar mapa de URL y certificado SSL administrado. 6) Crear target HTTPS proxy y forwarding rule.
**Points:** 3

## Question 9 (multiple_choice)
**Q:** ¿Qué métrica de Cloud Monitoring alertaría mejor sobre problemas de latencia en una aplicación Cloud Run?
**Options:**
- run/container/billable_time
- run/request_count
- run/request_latencies (percentil 95 o 99) ✓
- run/instance_count
**Explanation:** run/request_latencies con percentil 95 o 99 (p95/p99) muestra la latencia que experimentan la mayoría de usuarios, ignorando outliers. billable_time es para costos, request_count para tráfico, instance_count para escalado.
**Points:** 1

## Question 10 (open_ended)
**Q:** ¿Cuáles son las mejores prácticas para organizar proyectos y carpetas en una organización de Google Cloud usando Resource Manager?
**Keywords:** organización, carpetas, proyectos, políticas, herencia, entornos, dev, prod, billing, IAM
**Explanation:** Estructura recomendada: Organización → Carpetas por entorno (dev, staging, prod) o por equipo → Proyectos por aplicación/servicio. Las políticas IAM y Organization Policies se heredan jerárquicamente. Usa carpetas para agrupar por ciclo de vida o equipo, aplica políticas en el nivel más alto posible (herencia), separa billing por entorno si necesario.
**Points:** 2