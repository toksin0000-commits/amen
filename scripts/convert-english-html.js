// scripts/convert-english-html.js
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Mapování zkratek knih na ID
const bookMapping = {
  'GEN': 'genesis', 'EXO': 'exodus', 'LEV': 'leviticus', 'NUM': 'numbers',
  'DEU': 'deuteronomy', 'JOS': 'joshua', 'JDG': 'judges', 'RUT': 'ruth',
  '1SA': '1samuel', '2SA': '2samuel', '1KI': '1kings', '2KI': '2kings',
  '1CH': '1chronicles', '2CH': '2chronicles', 'EZR': 'ezra', 'NEH': 'nehemiah',
  'EST': 'esther', 'JOB': 'job', 'PSA': 'psalms', 'PRO': 'proverbs',
  'ECC': 'ecclesiastes', 'SNG': 'songofsolomon', 'ISA': 'isaiah', 'JER': 'jeremiah',
  'LAM': 'lamentations', 'EZK': 'ezekiel', 'DAN': 'daniel', 'HOS': 'hosea',
  'JOL': 'joel', 'AMO': 'amos', 'OBA': 'obadiah', 'JON': 'jonah',
  'MIC': 'micah', 'NAH': 'nahum', 'HAB': 'habakkuk', 'ZEP': 'zephaniah',
  'HAG': 'haggai', 'ZEC': 'zechariah', 'MAL': 'malachi',
  'MAT': 'matthew', 'MRK': 'mark', 'LUK': 'luke', 'JHN': 'john',
  'ACT': 'acts', 'ROM': 'romans', '1CO': '1corinthians', '2CO': '2corinthians',
  'GAL': 'galatians', 'EPH': 'ephesians', 'PHP': 'philippians', 'COL': 'colossians',
  '1TH': '1thessalonians', '2TH': '2thessalonians', '1TI': '1timothy', '2TI': '2timothy',
  'TIT': 'titus', 'PHM': 'philemon', 'HEB': 'hebrews', 'JAS': 'james',
  '1PE': '1peter', '2PE': '2peter', '1JN': '1john', '2JN': '2john',
  '3JN': '3john', 'JUD': 'jude', 'REV': 'revelation'
};

// Cesta ke složce s anglickými HTML soubory
const sourceDir = path.join(__dirname, '../temp/english');

function convertEnglishBible() {
  console.log('📖 Čtu anglické HTML soubory...');
  console.log(`Složka: ${sourceDir}`);
  
  if (!fs.existsSync(sourceDir)) {
    console.error('❌ Složka nebyla nalezena! Zkontroluj cestu.');
    console.log('Stáhni anglickou Bibli z https://ebible.org/eng-web/ a rozbal do temp/english/');
    return;
  }
  
  // Najdi všechny HTML soubory
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.htm') || f.endsWith('.html'));
  console.log(`✅ Nalezeno ${files.length} HTML souborů`);
  
  const bible = {};
  let totalVerses = 0;
  let processedFiles = 0;
  
  files.forEach(file => {
    // Ignorujeme soubory jako index.htm, copyright.htm atd.
    if (file === 'index.htm' || file === 'copyright.htm' || file === 'index.html' || file === 'copyright.html') return;
    
    // Název souboru: GEN01.htm, 1CH01.htm, PSA001.htm atd.
    const match = file.match(/^([A-Z0-9]+?)(\d+)\.html?$/);
    
    if (match) {
      const [, bookCodeFull, chapterStr] = match;
      
      // Některé kódy mají na konci číslo (např. ACT0, ACT1) - to je součást kódu knihy!
      let bookCode = bookCodeFull;
      
      // Zkusíme nejdřív celý kód
      if (!bookMapping[bookCode]) {
        // Pokud ne, zkusíme bez posledního čísla (ACT0 -> ACT)
        bookCode = bookCodeFull.replace(/\d+$/, '');
      }
      
      const chapter = parseInt(chapterStr);
      const bookId = bookMapping[bookCode];
      
      if (!bookId) {
        console.log(`  ⚠️ Přeskakuji ${file} (neznámý kód: ${bookCodeFull})`);
        return;
      }
      
      processedFiles++;
      
      // Načti HTML obsah
      const html = fs.readFileSync(path.join(sourceDir, file), 'utf8');
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Hledej verše - v anglické Bibli budou pravděpodobně také <span class="verse">
      // Nebo <sup class="verse">, zkusíme obojí
      let verseElements = document.querySelectorAll('span.verse');
      if (verseElements.length === 0) {
        verseElements = document.querySelectorAll('sup.verse');
      }
      if (verseElements.length === 0) {
        verseElements = document.querySelectorAll('.v');
      }
      
      if (verseElements.length === 0) {
        console.log(`  ⚠️ ${file} nemá žádné elementy .verse`);
        return;
      }
      
      if (!bible[bookId]) {
        bible[bookId] = { chapters: [] };
      }
      
      if (!bible[bookId].chapters[chapter - 1]) {
        bible[bookId].chapters[chapter - 1] = { verses: [] };
      }
      
      let chapterVerses = 0;
      
      verseElements.forEach(element => {
        // Získej číslo verše z atributu id nebo data-number
        let verseNum = null;
        
        if (element.id) {
          const idMatch = element.id.match(/\d+/);
          if (idMatch) verseNum = parseInt(idMatch[0]);
        }
        
        if (!verseNum && element.getAttribute('data-number')) {
          verseNum = parseInt(element.getAttribute('data-number'));
        }
        
        if (!verseNum) {
          // Zkusíme z textu elementu
          const textMatch = element.textContent.match(/\d+/);
          if (textMatch) verseNum = parseInt(textMatch[0]);
        }
        
        if (verseNum && !isNaN(verseNum)) {
          // Získej text - může být v rodičovském elementu
          let text = '';
          
          const parent = element.parentElement;
          if (parent) {
            // Odstraň samotný element s číslem, ale nech ostatní
            const clone = parent.cloneNode(true);
            const verseSpan = clone.querySelector('span.verse, sup.verse, .v');
            if (verseSpan) verseSpan.remove();
            text = clone.textContent.trim();
          }
          
          if (text) {
            bible[bookId].chapters[chapter - 1].verses[verseNum - 1] = {
              verse: verseNum,
              text: text
            };
            chapterVerses++;
            totalVerses++;
          }
        }
      });
      
      if (chapterVerses > 0) {
        console.log(`  📖 ${file} (${bookId} kap.${chapter}): ${chapterVerses} veršů`);
      } else {
        console.log(`  ⚠️ ${file} (${bookId} kap.${chapter}): 0 veršů`);
      }
    }
  });
  
  console.log(`✅ Zpracováno ${processedFiles} souborů s knihami`);
  
  // Vyčisti prázdná místa
  Object.keys(bible).forEach(bookId => {
    bible[bookId].chapters = bible[bookId].chapters.map(chapter => {
      if (chapter && chapter.verses) {
        chapter.verses = chapter.verses.filter(v => v != null);
      }
      return chapter;
    });
  });
  
  // Ulož výsledek
  const targetDir = path.join(__dirname, '../public/data/bible/en');
  if (!fs.existsSync(targetDir)) {
    console.log(`📁 Vytvářím složku: ${targetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const outputPath = path.join(targetDir, 'bible.json');
  fs.writeFileSync(outputPath, JSON.stringify(bible, null, 2));
  
  console.log(`✅ Angličtina uložena do: ${outputPath}`);
  console.log(`📊 Počet knih: ${Object.keys(bible).length}`);
  console.log(`📊 Celkem veršů: ${totalVerses}`);
}

convertEnglishBible();