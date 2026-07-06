const STOP_WORDS = new Set(["i","me","my","myself","we","our","ours","ourselves","you","your","yours","yourself","yourselves","he","him","his","himself","she","her","hers","herself","it","its","itself","they","them","their","theirs","themselves","what","which","who","whom","this","that","these","those","am","is","are","was","were","be","been","being","have","has","had","having","do","does","did","doing","a","an","the","and","but","if","or","because","as","until","while","of","at","by","for","with","about","against","between","into","through","during","before","after","above","below","to","from","up","down","in","out","on","off","over","under","again","further","then","once","here","there","when","where","why","how","all","any","both","each","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","s","t","can","will","just","don","should","now"]);
// The Master Dictionary of L1 Interference
const linguisticRules = {
    // === GERMANIC (DEU) ===
    "DEU": {
        "for": "German speakers often overuse 'for' due to preposition confusion (e.g., translating 'seit' incorrectly).",
        "so": "The German word 'so' is heavily used as a filler or intensifier. This habit transfers directly into English.",
        "there": "Translating the German phrase 'es gibt' (it gives/there is) leads to structural differences in introducing subjects.",
        "out": "German utilizes separable prefix verbs (like 'ausgehen'). This translates to a higher frequency of phrasal verbs ending in 'out'."
    },
    
    // === ROMANCE LANGUAGES (SPA, FRE, ITA) ===
    "SPA": {
        "the": "Spanish uses definite articles for abstract nouns (e.g., 'la libertad' -> 'the freedom'). Native speakers often over-insert 'the' in English.",
        "to": "Confusion between 'por' and 'para' in Spanish often leads to the misuse of 'to' and 'for' in English.",
        "it": "Spanish is a 'pro-drop' language (subjects can be omitted). Speakers often drop the word 'it' in English sentences like 'Is raining' instead of 'It is raining'."
    },
    "FRE": {
        "the": "Like Spanish, French speakers heavily overuse the definite article 'the' for generalizations (e.g., 'les gens' -> 'the people').",
        "of": "French expresses possession using 'de' (e.g., 'la voiture de John'). This causes an overuse of 'of' in English instead of using apostrophe-s (e.g., 'the car of John').",
        "which": "French relies heavily on relative pronouns ('qui'/'que'). Speakers tend to use 'which' to string together long, complex sentences."
    },
    "ITA": {
        "the": "Italian speakers over-insert definite articles ('il', 'la') before possessives or abstract concepts.",
        "that": "Italian heavily utilizes 'che' (that) as a universal conjunction, leading to run-on sentences stitched together by 'that'."
    },

    // === EAST ASIAN (ZHO/CHI, JPN, KOR) ===
    "ZHO": {
        "the": "Mandarin has no definite or indefinite articles. Speakers frequently under-use or completely omit 'the', 'a', and 'an'.",
        "be": "Mandarin does not conjugate verbs for tense. The verb 'to be' is often dropped or used incorrectly (e.g., 'He very happy' instead of 'He is very happy').",
        "there": "Mandarin uses 'you' (to have) for existence. This sometimes translates to using 'have' instead of 'there are'."
    },
    "JPN": {
        "the": "Japanese lacks an article system. Like Mandarin speakers, they often drop 'the' entirely.",
        "I": "Japanese is heavily context-dependent and frequently drops subjects (especially 'I'). You will often see missing pronouns in their English.",
        "in": "Japanese relies on post-positions (particles placed after nouns). Translating this to English prepositions ('in', 'on', 'at') causes massive statistical variance."
    },
    "KOR": {
        "the": "Korean has no direct equivalent to English articles, resulting in a statistical absence of 'the'.",
        "of": "Korean possesses a strict Subject-Object-Verb order. Restructuring sentences into English often causes variance in linking words like 'of'."
    },

    // === INDO-ARYAN / DRAVIDIAN (HIN, TEL) ===
    "HIN": {
        "the": "Hindi does not have definite articles. Speakers often overcompensate by using 'the' where it isn't needed, or dropping it entirely.",
        "is": "Hindi uses progressive tenses (Action + 'ing') much more broadly than English (e.g., 'I am knowing this'). This causes a spike in 'is', 'am', and 'are'.",
        "doing": "The overuse of the progressive tense leads to a high frequency of 'doing', 'being', and 'having'."
    },

    // === OTHER (ARA, TUR) ===
    "ARA": {
        "and": "Arabic discourse naturally strings many sentences together using 'wa' (and). Arabic speakers will statistically overuse 'and' to begin sentences.",
        "in": "Preposition mapping between Arabic and English is highly irregular, causing spikes in the use of 'in', 'on', and 'at'."
    },
    "TUR": {
        "the": "Turkish is an agglutinative language with no definite articles. The word 'the' will statistically drop.",
        "is": "Because Turkish attaches suffixes to denote meaning (rather than separate verbs), standalone auxiliary verbs like 'is' and 'are' are often misused."
    }
};
let nliModel = null;

async function loadModel() {
    try {
        const response = await fetch('nli_model_production.json');
        nliModel = await response.json();
        document.getElementById('output-text').innerText = "AI Model Loaded successfully. Ready for text.";
    } catch (error) {
        document.getElementById('output-text').innerText = "Error loading model. Check console.";
        console.error("Model load error:", error);
    }
}

function extractFeatures(text) {
    const rawWords = text.toLowerCase().match(/\b\w+\b/g) || [];
    const filteredWords = rawWords.filter(w => STOP_WORDS.has(w));
    let ngrams = [];
    for (let i = 0; i < filteredWords.length; i++) {
        ngrams.push(filteredWords[i]); 
        if (i < filteredWords.length - 1) {
            ngrams.push(filteredWords[i] + " " + filteredWords[i+1]); 
        }
    }
    return ngrams;
}

// NEW: Function to highlight the top markers in the original text
function renderHighlightedText(originalText, topMarkers, winningLanguageCode) {
    let highlightedText = originalText;
    
    // We sort markers by length descending, so we highlight 2-grams before 1-grams 
    // to prevent highlighting half of a bigram by mistake.
    topMarkers.sort((a, b) => b.length - a.length);

    topMarkers.forEach(marker => {
        
        // 1. Check if we have an educational rule
        let tooltipText = "";
        
        if (linguisticRules[winningLanguageCode] && linguisticRules[winningLanguageCode][marker]) {
            tooltipText = linguisticRules[winningLanguageCode][marker];
        } else {
            // 2. The Smart Fallback!
            // If we don't have a specific rule, explain the math to the user.
            tooltipText = `Statistical Marker: The AI detected that native ${winningLanguageCode} speakers use the word '${marker}' at a distinct frequency compared to the global average.`;
        }

        // Use regex to wrap the word and inject the tooltip
        const regex = new RegExp(`\\b(${marker})\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, `<span class="marker-highlight" data-tooltip="${tooltipText}">$1</span>`);
    });

    return highlightedText.replace(/\n/g, '<br>'); // Preserve line breaks
}

function predictLanguage(text) {
    if (!nliModel) return "Model not loaded yet.";
    
    const ngrams = extractFeatures(text);
    if (ngrams.length === 0) return "Not enough structural words found to analyze.";

    let tfCounts = {};
    ngrams.forEach(ngram => {
        if (nliModel.vocabulary[ngram] !== undefined) {
            tfCounts[ngram] = (tfCounts[ngram] || 0) + 1;
        }
    });

    let vector = new Array(nliModel.idf.length).fill(0);
    let sumSquares = 0;
    
    for (const [ngram, count] of Object.entries(tfCounts)) {
        const vocabIndex = nliModel.vocabulary[ngram];
        const tfIdfValue = count * nliModel.idf[vocabIndex];
        vector[vocabIndex] = tfIdfValue;
        sumSquares += tfIdfValue * tfIdfValue;
    }
    
    const norm = Math.sqrt(sumSquares);
    if (norm > 0) {
        for (let i = 0; i < vector.length; i++) {
            vector[i] = vector[i] / norm;
        }
    }

    let results = [];
    for (let c = 0; c < nliModel.classes.length; c++) {
        let score = nliModel.intercept[c];
        let contributions = []; // NEW: Track what words caused this score

        for (let v = 0; v < vector.length; v++) {
            if (vector[v] !== 0) {
                let weight = nliModel.weights[c][v];
                let contribution = vector[v] * weight;
                score += contribution;

                // If this word pushed the score UP, save it
                if (contribution > 0) {
                    // Find the word by its vocabulary index
                    let word = Object.keys(nliModel.vocabulary).find(key => nliModel.vocabulary[key] === v);
                    contributions.push({ word: word, val: contribution });
                }
            }
        }
        
        // Sort contributions highest to lowest and grab the top 5
        contributions.sort((a, b) => b.val - a.val);
        let topFeatures = contributions.slice(0, 5).map(c => c.word);

        results.push({ language: nliModel.classes[c], rawScore: score, topFeatures: topFeatures });
    }

    const temperature = 0.3; 
    const maxScore = Math.max(...results.map(r => r.rawScore));
    let sumExp = 0;
    
    results.forEach(r => {
        r.exp = Math.exp((r.rawScore - maxScore) / temperature); 
        sumExp += r.exp;
    });

    results.forEach(r => {
        r.probability = (r.exp / sumExp) * 100;
    });

    results.sort((a, b) => b.probability - a.probability);

    // NEW: Update the UI to show the highlighted text for the #1 Prediction
    const winningLanguage = results[0];
    const highlightBox = document.getElementById('highlight-box');
    highlightBox.innerHTML = renderHighlightedText(text, winningLanguage.topFeatures, winningLanguage.language);
    
    // Toggle UI elements
    document.getElementById('lab-input').style.display = 'none';
    document.getElementById('analyze-btn').style.display = 'none';
    highlightBox.style.display = 'block';
    document.getElementById('reset-btn').style.display = 'block';

    let htmlOutput = `<strong>Top Predictions:</strong><ol>`;
    for (let i = 0; i < Math.min(3, results.length); i++) {
        let confidence = results[i].probability.toFixed(1); 
        let barWidth = Math.max(confidence, 1); 
        
        htmlOutput += `
            <li style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span>${results[i].language}</span>
                    <span>${confidence}%</span>
                </div>
                <div style="width: 100%; background-color: #ddd; height: 8px; border-radius: 4px;">
                    <div style="width: ${barWidth}%; background-color: #2b5797; height: 100%; border-radius: 4px;"></div>
                </div>
            </li>`;
    }
    
    htmlOutput += `</ol><p style="font-size: 0.9em; color: #555;"><em>Highlighted words in the text above strongly indicate grammatical structures common in native <strong>${winningLanguage.language}</strong> speakers.</em></p>`;

    return htmlOutput;
}

// Hook up the Analyze button
document.getElementById('analyze-btn').addEventListener('click', () => {
    const text = document.getElementById('lab-input').value;
    if(text.trim() === "") return;
    const result = predictLanguage(text);
    document.getElementById('output-text').innerHTML = result;
});

// Hook up the Reset button
document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('lab-input').style.display = 'block';
    document.getElementById('analyze-btn').style.display = 'block';
    document.getElementById('highlight-box').style.display = 'none';
    document.getElementById('reset-btn').style.display = 'none';
});

// Initialize
loadModel();