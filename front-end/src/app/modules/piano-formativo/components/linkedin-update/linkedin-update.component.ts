import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ModaleService } from '../../../../core/services/modal.service';
import { AssegnazioniService } from '../../../../core/services/data/assegnazioni.service';
import {
  ImportModalComponent,
  ImportOption,
  ImportData,
} from '../../../../shared/components/import-modal/import-modal.component';

interface LinkedInImportData {
  nomeDipendente: string;
  emailDipendente: string;
  corso: string;
  linkedinContentId: string;
  idUtenteUnico?: string;
  fornitoreContenuto?: string;
  tipoContenuto?: string;
  oreVisione?: string;
  percentualeCompletamento?: string;
  dataInizio?: string;
  ultimaVisualizzazione?: string;
  dataCompletamento?: string;
  valutazioniTotali?: string;
  numeroValutazioni?: string;
  competenze?: string;
  nomeCorsoLinkedin?: string;
  idCorsoLinkedin?: string;
  gruppiInterazione?: string;
  gruppiAttuali?: string;
  errors?: string[];
  isDuplicate?: boolean;
  rowNumber?: number;
}

@Component({
  selector: 'app-linkedin-update',
  standalone: true,
  imports: [CommonModule, FormsModule, ImportModalComponent],
  templateUrl: './linkedin-update.component.html',
  styleUrls: ['./linkedin-update.component.css'],
})
export class LinkedinUpdateComponent implements OnInit {
  @Output() importCompleted = new EventEmitter<void>();

  selectedFile: File | null = null;
  isProcessing = false;
  previewData: ImportData[] = [];
  showPreview = false;
  validationErrors: string[] = [];

  // Formati supportati per LinkedIn (solo CSV)
  supportedFormats: string[] = ['.csv'];

  linkedinHeaders = [
    'Nome', 'Email', 'ID utente univoco', 'Nome contenuto', 'Fornitore contenuto',
    'Tipo di contenuto', 'ID contenuto', 'Ore di visione', 'Percentuale di completamento',
    'Inizio (PST/PDT)', 'Ultima visualizzazione nell\'intervallo di tempo (PST/PDT)',
    'Completamento (PST/PDT)', 'Valutazioni totali', 'Numero di valutazioni completate',
    'Competenze', 'Nome corso (solo video di LinkedIn)', 'ID corso (solo video di LinkedIn)',
    'Gruppi (al momento dell\'interazione)', 'Gruppi (iscrizioni attuali)'
  ];

  // Opzioni specifiche per LinkedIn
  linkedinImportOptions: ImportOption[] = [
    {
      key: 'updateExisting',
      label: 'Aggiorna assegnazioni esistenti',
      value: true,
    },
    {
      key: 'createMissingCourses', 
      label: 'Crea automaticamente corsi mancanti',
      value: true,
    },
    {
      key: 'forceOverwrite',
      label: 'Sovrascrivi dati anche se più recenti',
      value: false,
    },
  ];

  // Colonne per la preview table
  linkedinTableColumns = [
    { key: 'nomeDipendente', label: 'Nome' },
    { key: 'emailDipendente', label: 'Email' },
    { key: 'corso', label: 'Corso' },
    { key: 'linkedinContentId', label: 'LinkedIn ID' },
    { key: 'percentualeCompletamento', label: 'Completamento' },
    { key: 'oreVisione', label: 'Ore' },
    { key: 'dataCompletamento', label: 'Data Completamento' },
    { key: 'competenze', label: 'Competenze' },
  ];

  constructor(
    private assegnazioniService: AssegnazioniService,
    private toastr: ToastrService,
    private modaleService: ModaleService,
  ) {}

  ngOnInit(): void {
    this.resetImport();
  }

  // Helper methods per compatibilità con import-modal
  private getImportOption(key: string): boolean {
    const option = this.linkedinImportOptions.find(opt => opt.key === key);
    return option ? option.value : false;
  }

  onFileSelected(file: File): void {
    this.selectedFile = file;
    this.processFile();
  }

  resetImport(): void {
    this.selectedFile = null;
    this.previewData = [];
    this.showPreview = false;
    this.validationErrors = [];
    this.isProcessing = false;
  }

  private processFile(): void {
    if (!this.selectedFile) return;

    this.isProcessing = true;
    this.validationErrors = [];

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        
        if (!csvContent || csvContent.trim().length === 0) {
          this.validationErrors.push('Il file è vuoto');
          this.isProcessing = false;
          return;
        }

        // 🔍 DEBUG: Mostra contenuto raw del file
        console.log('📄 File CSV caricato - Prime 3 righe:');
        const lines = csvContent.split('\n').filter(line => line.trim());
        lines.slice(0, 3).forEach((line, index) => {
          console.log(`Riga ${index}: "${line}"`);
          console.log(`Lunghezza riga ${index}: ${line.length} caratteri`);
        });

        if (lines.length < 2) {
          this.validationErrors.push('Il file deve contenere almeno una riga di dati oltre all\'header');
          this.isProcessing = false;
          return;
        }

        // 🔍 DEBUG: Parsing dell'header
        console.log('🔍 PARSING HEADER:');
        console.log('Header grezzo:', lines[0]);
        const headers = this.parseCSVLine(lines[0]);
        console.log('Header parsato:', headers);
        console.log('Numero colonne trovate:', headers.length);
        console.log('Prime 5 colonne:', headers.slice(0, 5));

        // Verifica se è un CSV LinkedIn valido
        if (!this.isLinkedInCSV(csvContent)) {
          this.validationErrors.push(
            'Il file caricato non sembra essere un CSV di LinkedIn Learning. ' +
            'Verifica che contenga le colonne corrette (Nome, Email, Nome contenuto, ecc.)'
          );
          this.isProcessing = false;
          return;
        }

        // Valida headers
        if (!this.validateLinkedInHeaders(headers)) {
          this.isProcessing = false;
          return;
        }

        console.log('✅ LinkedIn CSV headers validati con successo');

        // 🔍 DEBUG: Parsing delle prime 3 righe dati
        console.log('🔍 PARSING RIGHE DATI:');
        this.previewData = [];
        for (let i = 1; i < lines.length && i <= 3; i++) { // Prima parse solo 3 righe per debug
          console.log(`\nRiga ${i} grezza: "${lines[i]}"`);
          const values = this.parseCSVLine(lines[i]);
          console.log(`Riga ${i} parsata: ${values.length} colonne`);
          console.log(`Prime 5 valori riga ${i}:`, values.slice(0, 5));
          
          if (values.length === 0 || !values[0]) {
            console.log(`⚠️ Riga ${i} vuota, saltata`);
            continue;
          }

          const linkedinData = this.mapRowToLinkedInData(values, headers, i + 1);
          console.log(`Dati mappati riga ${i}:`, {
            nome: linkedinData.nomeDipendente,
            email: linkedinData.emailDipendente,
            corso: linkedinData.corso,
            linkedinId: linkedinData.linkedinContentId
          });
          this.previewData.push(linkedinData);
        }

        // Se il debug delle prime 3 righe va bene, processa tutto
        if (this.previewData.length > 0) {
          console.log('✅ Prime 3 righe processate con successo, continuo con tutto il file...');
          
          // Reset e processa tutto il file
          this.previewData = [];
          for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === 0 || !values[0]) continue;

            const linkedinData = this.mapRowToLinkedInData(values, headers, i + 1);
            this.previewData.push(linkedinData);
          }
        }

        this.validateLinkedInData();
        this.checkLinkedInDuplicates();
        this.showPreview = true;
        this.isProcessing = false;

        console.log(`✅ Processate ${this.previewData.length} righe LinkedIn totali`);
        
      } catch (error) {
        console.error('❌ Errore durante il parsing:', error);
        this.validationErrors.push(
          'Errore durante la lettura del file CSV: ' + error
        );
        this.isProcessing = false;
      }
    };

    reader.readAsText(this.selectedFile);
  }

  private isLinkedInCSV(csvContent: string): boolean {
    const firstLine = csvContent.split('\n')[0];
    const headerText = firstLine.toLowerCase();
    
    // Verifica presenza di almeno 4 colonne chiave di LinkedIn
    const linkedinKeywords = ['nome', 'email', 'nome contenuto', 'id contenuto'];
    return linkedinKeywords.filter(keyword => 
      headerText.includes(keyword)
    ).length >= 4;
  }

  // Migliora la validazione degli header
  private validateLinkedInHeaders(headers: string[]): boolean {
    console.log('🔍 VALIDAZIONE HEADERS:');
    console.log('Headers ricevuti:', headers);
    console.log('Numero headers:', headers.length);
    
    if (headers.length < 19) {
      console.error(`❌ Deve avere almeno 19 colonne, trovate: ${headers.length}`);
      this.validationErrors.push(
        `Il CSV LinkedIn deve avere almeno 19 colonne. Trovate: ${headers.length}`
      );
      return false;
    }

    // Verifica colonne critiche con debug dettagliato
    const criticalHeaders = ['nome', 'email', 'nome contenuto', 'id contenuto'];
    const missingCritical = criticalHeaders.filter(critical => {
      const found = headers.some(header => 
        header && header.toLowerCase().includes(critical)
      );
      console.log(`Colonna critica "${critical}": ${found ? '✅ trovata' : '❌ mancante'}`);
      return !found;
    });

    if (missingCritical.length > 0) {
      console.error('❌ Colonne critiche mancanti:', missingCritical);
      this.validationErrors.push(
        `Colonne LinkedIn critiche mancanti: ${missingCritical.join(', ')}`
      );
      return false;
    }

    console.log('✅ Headers validati con successo');
    return true;
  }

//   private parseCSVLine(line: string): string[] {
//     console.log(`🔧 Parsing riga: "${line.substring(0, 100)}${line.length > 100 ? '...' : ''}"`);
    
//     const result: string[] = [];
//     let current = '';
//     let inQuotes = false;
    
//     // Rimuovi eventuali BOM e caratteri strani all'inizio
//     line = line.replace(/^\uFEFF/, '').trim();
    
//     for (let i = 0; i < line.length; i++) {
//       const char = line[i];
      
//       if (char === '"') {
//         if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
//           // Doppi apici escaped
//           current += '"';
//           i++; // Skip il prossimo apice
//         } else {
//           // Entra o esce dalle virgolette
//           inQuotes = !inQuotes;

//         }
//       } else if (char === ',' && !inQuotes) {
//         // Virgola separatrice (non dentro virgolette)
//         result.push(current.trim());
//         current = '';
//       } else {
//         // Carattere normale
//         current += char;
//       }
//     }
    
//     // Aggiungi l'ultima colonna
//     result.push(current.trim());
    
//     console.log(`🔧 Risultato parsing: ${result.length} colonne`);
//     return result;
//   }

    private parseCSVLine(line: string): string[] {
  console.log(`🔧 Parsing riga: "${line.substring(0, 100)}${line.length > 100 ? '...' : ''}"`);
  
  // Rimuovi BOM e trim
  line = line.replace(/^\uFEFF/, '').trim();
  
  // APPROCCIO SPECIFICO PER LINKEDIN - gestisce virgolette multiple
  const result: string[] = [];
  let current = '';
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === ',') {
      // Virgola trovata - aggiungi il campo corrente
      result.push(this.cleanLinkedInField(current));
      current = '';
    } else {
      // Carattere normale - aggiungilo al campo corrente
      current += char;
    }
    i++;
  }
  
  // Aggiungi l'ultimo campo
  result.push(this.cleanLinkedInField(current));
  
  console.log(`🔧 Risultato parsing: ${result.length} colonne`);
  console.log(`🔧 Prime 3 colonne pulite:`, result.slice(0, 3));
  
  return result;
}

// 🆕 NUOVO METODO: Pulisce i campi LinkedIn dalle virgolette multiple
private cleanLinkedInField(field: string): string {
  if (!field) return '';
  
  let cleaned = field.trim();
  
  console.log(`🔧 Campo originale: "${cleaned}"`);
  
  // Gestione virgolette LinkedIn:
  // "campo normale" → campo normale
  // ""campo con virgolette"" → campo con virgolette  
  // """" → stringa vuota
  // """"testo"""" → testo
  
  // Se inizia e finisce con virgolette, rimuovile progressivamente
  while (cleaned.startsWith('"') && cleaned.endsWith('"') && cleaned.length >= 2) {
    cleaned = cleaned.slice(1, -1);
    console.log(`🔧 Dopo rimozione virgolette: "${cleaned}"`);
  }
  
  // Gestisci doppi apici interni (escape)
  // "" all'interno diventa "
  cleaned = cleaned.replace(/""/g, '"');
  
  console.log(`🔧 Campo finale: "${cleaned}"`);
  return cleaned;
}

  private mapRowToLinkedInData(
    values: string[], 
    headers: string[], 
    rowNumber: number
  ): LinkedInImportData {
    
    const linkedinData: LinkedInImportData = {
      nomeDipendente: '',
      emailDipendente: '',
      corso: '',
      linkedinContentId: '',
      errors: [],
      rowNumber: rowNumber
    };

    // Mappatura delle 19 colonne LinkedIn
    if (values.length >= 19) {
      linkedinData.nomeDipendente = values[0]?.trim() || '';                    // Colonna 0: Nome
      linkedinData.emailDipendente = values[1]?.trim() || '';                   // Colonna 1: Email
      linkedinData.idUtenteUnico = values[2]?.trim() || '';                     // Colonna 2: ID utente univoco
      linkedinData.corso = values[3]?.trim() || '';                             // Colonna 3: Nome contenuto
      linkedinData.fornitoreContenuto = values[4]?.trim() || '';                // Colonna 4: Fornitore contenuto
      linkedinData.tipoContenuto = values[5]?.trim() || '';                     // Colonna 5: Tipo di contenuto
      linkedinData.linkedinContentId = values[6]?.trim() || '';                 // Colonna 6: ID contenuto
      linkedinData.oreVisione = this.convertToSimpleNumber(values[7]?.trim() || '');                        // Colonna 7: Ore di visione
      linkedinData.percentualeCompletamento = this.cleanPercentage(values[8]?.trim() || '');         // Colonna 8: Percentuale
      linkedinData.dataInizio = values[9]?.trim() || '';                        // Colonna 9: Inizio (PST/PDT)
      linkedinData.ultimaVisualizzazione = values[10]?.trim() || '';            // Colonna 10: Ultima visualizzazione
      linkedinData.dataCompletamento = values[11]?.trim() || '';                // Colonna 11: Completamento
      linkedinData.valutazioniTotali = values[12]?.trim() || '';                // Colonna 12: Valutazioni totali
      linkedinData.numeroValutazioni = values[13]?.trim() || '';                // Colonna 13: Numero valutazioni
      linkedinData.competenze = values[14]?.trim() || '';                       // Colonna 14: Competenze
      linkedinData.nomeCorsoLinkedin = values[15]?.trim() || '';                // Colonna 15: Nome corso LinkedIn
      linkedinData.idCorsoLinkedin = values[16]?.trim() || '';                  // Colonna 16: ID corso LinkedIn
      linkedinData.gruppiInterazione = values[17]?.trim() || '';                // Colonna 17: Gruppi interazione
      linkedinData.gruppiAttuali = values[18]?.trim() || '';                    // Colonna 18: Gruppi attuali
    }

    console.log(`🔧 Dati convertiti riga ${rowNumber}:`, {
    percentuale: `"${values[8]}" → "${linkedinData.percentualeCompletamento}"`,
    ore: `"${values[7]}" → "${linkedinData.oreVisione}"`,
    email: linkedinData.emailDipendente,
    corso: linkedinData.corso
    });


    return linkedinData;
  }

  // Aggiorna validateLinkedInData() per vedere esattamente cosa viene validato
  private validateLinkedInData(): void {
    this.previewData.forEach((linkedinData, index) => {
      linkedinData.errors = [];

      console.log(`\n🔍 Validando riga ${index + 1}:`, {
        percentuale: linkedinData['percentualeCompletamento'],
        ore: linkedinData['oreVisione'],
        email: linkedinData['emailDipendente']
      });

      // Valida campi obbligatori
      if (!linkedinData['nomeDipendente']) {
        linkedinData.errors!.push('Nome dipendente è obbligatorio');
      }

      if (!linkedinData['emailDipendente']) {
        linkedinData.errors!.push('Email dipendente è obbligatoria');
      } else if (!this.isValidEmail(linkedinData['emailDipendente'])) {
        linkedinData.errors!.push('Formato email non valido');
      }

      if (!linkedinData['corso']) {
        linkedinData.errors!.push('Nome corso è obbligatorio');
      }

      if (!linkedinData['linkedinContentId']) {
        linkedinData.errors!.push('LinkedIn Content ID è obbligatorio');
      }

      // Debug specifico per percentuale
      console.log(`🔧 Testando percentuale: "${linkedinData['percentualeCompletamento']}"`);
      if (linkedinData['percentualeCompletamento'] && 
          !this.isValidPercentage(linkedinData['percentualeCompletamento'])) {
        console.error(`❌ Percentuale non valida: "${linkedinData['percentualeCompletamento']}"`);
        linkedinData.errors!.push('Formato percentuale completamento non valido');
      }

      // Debug specifico per ore
      console.log(`🔧 Testando ore: "${linkedinData['oreVisione']}"`);
      if (linkedinData['oreVisione'] && 
          !this.isValidDuration(linkedinData['oreVisione'])) {
        console.error(`❌ Ore non valide: "${linkedinData['oreVisione']}"`);
        linkedinData.errors!.push('Formato ore di visione non valido');
      }

      if (linkedinData.errors!.length > 0) {
        console.error(`❌ Errori riga ${index + 1}:`, linkedinData.errors);
      } else {
        console.log(`✅ Riga ${index + 1} valida`);
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

private isValidPercentage(percentage: string): boolean {
  if (!percentage || percentage.trim() === '') return true; // Campo opzionale
  
  const num = parseFloat(percentage);
  const isValid = !isNaN(num) && num >= 0 && num <= 100;
  
  console.log(`🔧 Validazione percentuale "${percentage}": ${isValid ? '✅' : '❌'} (numero: ${num})`);
  return isValid;
}

private isValidDuration(duration: string): boolean {
  if (!duration || duration.trim() === '') return true; // Campo opzionale
  
  const num = parseFloat(duration);
  const isValid = !isNaN(num) && num >= 0;
  
  console.log(`🔧 Validazione durata "${duration}": ${isValid ? '✅' : '❌'} (numero: ${num})`);
  return isValid;
}

  private checkLinkedInDuplicates(): void {
    // Marca duplicati potenziali basati su emailDipendente + linkedinContentId
    const seen = new Map<string, ImportData>();

    this.previewData.forEach(linkedinData => {
      const key = `${linkedinData['emailDipendente']}-${linkedinData['linkedinContentId']}`.toLowerCase();

      if (seen.has(key)) {
        linkedinData.isDuplicate = true;
        seen.get(key)!.isDuplicate = true;
      } else {
        seen.set(key, linkedinData);
      }
    });
  }

  getValidLinkedInData(): ImportData[] {
    return this.previewData.filter(data => !data.errors || data.errors.length === 0);
  }

  getDuplicateCount(): number {
    return this.previewData.filter(data => data.isDuplicate).length;
  }

  getErrorCount(): number {
    return this.previewData.filter(data => data.errors && data.errors.length > 0).length;
  }

  performLinkedInUpdate(): void {
    const validLinkedInData = this.getValidLinkedInData();

    if (validLinkedInData.length === 0) {
      this.toastr.error('Nessun dato LinkedIn valido da processare');
      return;
    }

    this.isProcessing = true;

    // Map to backend LinkedIn format
    const importData = {
      assegnazioni: validLinkedInData.map(data => ({
        nomeDipendente: data['nomeDipendente'],
        emailDipendente: data['emailDipendente'],
        idUtenteUnico: data['idUtenteUnico'] || null,
        corso: data['corso'],
        fornitoreContenuto: data['fornitoreContenuto'] || null,
        tipoContenuto: data['tipoContenuto'] || null,
        linkedinContentId: data['linkedinContentId'],
        oreVisione: data['oreVisione'] || null,
        percentualeCompletamento: data['percentualeCompletamento'] || null,
        dataInizio: data['dataInizio'] || null,
        ultimaVisualizzazione: data['ultimaVisualizzazione'] || null,
        dataCompletamento: data['dataCompletamento'] || null,
        valutazioniTotali: data['valutazioniTotali'] || null,
        numeroValutazioni: data['numeroValutazioni'] || null,
        competenze: data['competenze'] || null,
        nomeCorsoLinkedin: data['nomeCorsoLinkedin'] || null,
        idCorsoLinkedin: data['idCorsoLinkedin'] || null,
        gruppiInterazione: data['gruppiInterazione'] || null,
        gruppiAttuali: data['gruppiAttuali'] || null,
      })),
      options: {
        updateExisting: this.getImportOption('updateExisting'),
        createMissingCourses: this.getImportOption('createMissingCourses'),
        forceOverwrite: this.getImportOption('forceOverwrite'),
        source: 'LinkedIn Learning'
      },
    };

    console.log('LinkedIn update data being sent:', JSON.stringify(importData, null, 2));
    console.log('First LinkedIn item sample:', importData.assegnazioni[0]);

    this.assegnazioniService.linkedinUpdate(importData).subscribe({
      next: (response: any) => {
        this.handleLinkedInResponse(response);
      },
      error: (error: any) => {
        this.isProcessing = false;
        this.toastr.error('Errore durante l\'aggiornamento LinkedIn: ' + error.message);
        console.error('LinkedIn update error:', error);
      },
    });
  }

  private handleLinkedInResponse(response: any): void {
    this.isProcessing = false;

    const { 
      totalProcessed, 
      successCount, 
      createdCount, 
      updatedCount, 
      errorCount, 
      coursesCreatedCount 
    } = response;

    if (successCount > 0) {
      this.toastr.success(
        `${successCount} aggiornamenti LinkedIn completati con successo`
      );
    }

    if (createdCount > 0) {
      this.toastr.success(`${createdCount} nuove assegnazioni create`);
    }

    if (updatedCount > 0) {
      this.toastr.info(`${updatedCount} assegnazioni aggiornate`);
    }

    if (coursesCreatedCount > 0) {
      this.toastr.info(`${coursesCreatedCount} corsi creati automaticamente`);
    }

    if (errorCount > 0) {
      this.toastr.warning(`${errorCount} righe con errori`);
    }

    // Show detailed errors if any
    if (response.errors && response.errors.length > 0) {
      const errorMessages = response.errors.map(
        (error: any) => `Riga ${error.rowNumber}: ${error.errorMessage}`
      );
      this.validationErrors = errorMessages;
    }

    // Close modal and refresh parent component
    if (successCount > 0 || updatedCount > 0 || createdCount > 0) {
      this.importCompleted.emit();
      this.modaleService.chiudi();
    }
  }

  closeModal(): void {
    this.modaleService.chiudi();
  }

  onImportOptionsChanged(options: { [key: string]: any }): void {
    this.linkedinImportOptions.forEach(option => {
      if (options.hasOwnProperty(option.key)) {
        option.value = options[option.key];
      }
    });
  }

  onImportConfirmed(): void {
    this.performLinkedInUpdate();
  }

  onImportCancelled(): void {
    this.resetImport();
  }

  onResetRequested(): void {
    this.resetImport();
  }

    private cleanPercentage(percentage: string): string {
    if (!percentage) return '';
    
    console.log(`🔧 Input percentuale originale: "${percentage}"`);
    
    // Rimuovi % e tutti i caratteri non numerici eccetto punto e virgola
    let cleaned = percentage.replace(/%/g, '').replace(/[^\d.,]/g, '').trim();
    
    // Se rimane vuoto dopo la pulizia, ritorna stringa vuota
    if (!cleaned) {
        console.log(`🔧 Percentuale vuota dopo pulizia`);
        return '';
    }
    
    // Converti virgola in punto per i decimali
    cleaned = cleaned.replace(',', '.');
    
    // Verifica che sia un numero valido
    const num = parseFloat(cleaned);
    if (isNaN(num)) {
        console.log(`🔧 Percentuale non numerica: "${cleaned}"`);
        return '';
    }
    
    // Assicurati che sia nel range 0-100 e formattato correttamente per il DB
    const finalValue = Math.min(Math.max(num, 0), 100).toString();
    
    console.log(`🔧 Percentuale finale: "${percentage}" → "${finalValue}"`);
    return finalValue;
    }

private convertToSimpleNumber(timeString: string): string {
  if (!timeString) return '';
  
  console.log(`🔧 Input ore originale: "${timeString}"`);
  
  // Per ore in formato "00:00:12" (H:M:S)
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length === 3) {
      // Formato H:M:S - converti tutto in minuti decimali
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      
      const totalMinutes = (hours * 60) + minutes + (seconds / 60);
      const finalValue = totalMinutes.toFixed(2);
      
      console.log(`🔧 Ore convertite: "${timeString}" → "${finalValue}" minuti`);
      return finalValue;
    }
  }
  
  // Per altri formati, estrai solo numeri
  let cleaned = timeString.replace(/[^\d.,]/g, '');
  cleaned = cleaned.replace(',', '.');
  
  const num = parseFloat(cleaned);
  if (isNaN(num)) {
    console.log(`🔧 Ore non numeriche: "${cleaned}"`);
    return '';
  }
  
  const finalValue = Math.max(num, 0).toString();
  console.log(`🔧 Ore finali: "${timeString}" → "${finalValue}"`);
  return finalValue;
}

}