# Sistema Gestione Formazione Aziendale - API Documentation

## 📋 Panoramica

REST API per la gestione della formazione aziendale che permette a un Responsabile della Formazione di:

- Registrare dipendenti
- Inserire corsi associati a piattaforme
- Assegnare corsi ai dipendenti

## 🚀 Come iniziare

### Prerequisiti

- Java 17+
- Maven 3.8+
- Database MySQL (opzionale, di default usa H2)

### Avvio dell'applicazione

```bash
cd back-end
./mvnw spring-boot:run
```

### Accesso alla documentazione Swagger

Una volta avviata l'applicazione, la documentazione interattiva Swagger è disponibile all'indirizzo:

```
http://localhost:8080/swagger-ui/index.html
```

## 📚 Endpoints principali

### 👥 Gestione Dipendenti

#### POST /api/dipendenti

Registra un nuovo dipendente nel sistema.

**Esempio richiesta:**

```json
{
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@azienda.com",
  "codiceDipendente": "MR123",
  "reparto": "IT",
  "commerciale": "Centro-Nord"
}
```

**Risposta di successo (201):**

```json
{
  "id": 1,
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@azienda.com",
  "codiceDipendente": "MR123",
  "reparto": "IT",
  "commerciale": "Centro-Nord",
  "attivo": true,
  "dataCreazione": "2024-01-15T10:30:00"
}
```

#### GET /api/dipendenti

Recupera l'elenco completo dei dipendenti con filtri opzionali.

**Parametri query opzionali:**

- `search`: Cerca per nome, cognome o email
- `reparto`: Filtra per reparto
- `commerciale`: Filtra per area commerciale
- `soloAttivi`: Mostra solo dipendenti attivi (default: true)

**Esempio chiamata:**

```
GET /api/dipendenti?search=mario&soloAttivi=true
```

### 📚 Gestione Corsi

#### POST /api/corsi

Crea un nuovo corso associato a una piattaforma.

**Esempio richiesta:**

```json
{
  "nome": "Project Management Base",
  "piattaformaId": 1,
  "stato": "PIANIFICATO",
  "dataInizio": "2025-06-01",
  "dataFine": "2025-06-15",
  "durata": 12.0,
  "feedbackRichiesto": true
}
```

**Stati corso possibili:**

- `PIANIFICATO`
- `IN_CORSO`
- `COMPLETATO`
- `SOSPESO`
- `ANNULLATO`
- `SCADUTO`

#### GET /api/corsi

Recupera l'elenco dei corsi con filtri opzionali.

**Parametri query opzionali:**

- `piattaformaId`: Filtra per piattaforma
- `stato`: Filtra per stato corso
- `search`: Cerca nel nome del corso
- `categoria`: Filtra per categoria
- `soloAttivi`: Mostra solo corsi attivi
- `richiedeFeedback`: Mostra solo corsi che richiedono feedback

### 🔗 Gestione Assegnazioni

#### POST /api/dipendenti/{dipendenteId}/corsi/{corsoId}

**Endpoint principale**: Assegna un corso specifico a un dipendente specifico.

**Esempio chiamata:**

```
POST /api/dipendenti/1/corsi/1
```

**Risposta di successo (201):**

```json
{
  "id": 1,
  "dipendente": {
    "id": 1,
    "nome": "Mario",
    "cognome": "Rossi"
  },
  "corso": {
    "id": 1,
    "nome": "Project Management Base"
  },
  "stato": "ASSEGNATO",
  "dataAssegnazione": "2024-01-15",
  "percentualeCompletamento": 0.0
}
```

**Stati assegnazione possibili:**

- `ASSEGNATO`
- `IN_CORSO`
- `COMPLETATO`
- `NON_INIZIATO`
- `SOSPESO`
- `ANNULLATO`

#### GET /api/dipendenti/{dipendenteId}/assegnazioni

Recupera tutte le assegnazioni di un dipendente specifico.

#### GET /api/corsi/{corsoId}/assegnazioni

Recupera tutte le assegnazioni di un corso specifico.

### 🏢 Gestione Piattaforme

#### GET /api/piattaforme

Recupera tutte le piattaforme di formazione disponibili.

#### POST /api/piattaforme

Crea una nuova piattaforma di formazione.

**Esempio richiesta:**

```json
{
  "nome": "LinkedIn Learning",
  "descrizione": "Piattaforma di formazione professionale online",
  "urlSito": "https://www.linkedin.com/learning/"
}
```

## 🔍 Esempi di utilizzo completi

### Scenario completo: Registrazione e assegnazione

1. **Crea una piattaforma:**

```bash
curl -X POST http://localhost:8080/api/piattaforme \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Coursera",
    "descrizione": "Piattaforma di corsi universitari online"
  }'
```

2. **Registra un dipendente:**

```bash
curl -X POST http://localhost:8080/api/dipendenti \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Anna",
    "cognome": "Verdi",
    "email": "anna.verdi@azienda.com",
    "codiceDipendente": "AV456",
    "reparto": "Marketing",
    "commerciale": "Sud"
  }'
```

3. **Crea un corso:**

```bash
curl -X POST http://localhost:8080/api/corsi \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Digital Marketing Fundamentals",
    "piattaformaId": 1,
    "stato": "PIANIFICATO",
    "dataInizio": "2025-02-01",
    "dataFine": "2025-02-28",
    "durata": 20.0,
    "feedbackRichiesto": true
  }'
```

4. **Assegna il corso al dipendente:**

```bash
curl -X POST http://localhost:8080/api/dipendenti/1/corsi/1
```

5. **Verifica le assegnazioni del dipendente:**

```bash
curl http://localhost:8080/api/dipendenti/1/assegnazioni
```

## 🎯 Filtri e ricerche avanzate

### Ricerca dipendenti per nome

```
GET /api/dipendenti?search=mario
```

### Corsi di una specifica piattaforma con stato attivo

```
GET /api/corsi?piattaformaId=1&stato=IN_CORSO
```

### Assegnazioni completate che richiedono feedback

```
GET /api/assegnazioni?stato=COMPLETATO&richiedeFeedback=true
```

## ⚠️ Gestione errori

L'API restituisce codici di stato HTTP standard:

- **200 OK**: Operazione completata con successo
- **201 Created**: Risorsa creata con successo
- **400 Bad Request**: Dati richiesta non validi
- **404 Not Found**: Risorsa non trovata
- **409 Conflict**: Conflitto (es. duplicato)

### Esempi di errori

**Dipendente duplicato (409):**

```json
{
  "error": "Email già esistente: mario.rossi@azienda.com"
}
```

**Piattaforma non trovata (404):**

```json
{
  "error": "Piattaforma non trovata con ID: 999"
}
```

## 🔧 Configurazione database

### H2 (default - sviluppo)

L'applicazione usa H2 di default per lo sviluppo. I dati sono temporanei.

### MySQL (produzione)

Per usare MySQL, modifica `application.properties`:

```properties
spring.profiles.active=mysql
```

E configura `application-mysql.properties` con i tuoi parametri di connessione.

## 📊 Monitoraggio

### Health Check

```
GET /actuator/health
```

### Metriche API

```
GET /actuator/metrics
```

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch per la tua feature
3. Commit delle modifiche
4. Push del branch
5. Crea una Pull Request

---

**Versione API:** 1.0.0  
**Ultimo aggiornamento:** Gennaio 2024
