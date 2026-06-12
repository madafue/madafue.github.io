const STOP_WORDS = new Set(["i","me","my","myself","we","our","ours","ourselves","you","your","yours","yourself","yourselves","he","him","his","himself","she","her","hers","herself","it","its","itself","they","them","their","theirs","themselves","what","which","who","whom","this","that","these","those","am","is","are","was","were","be","been","being","have","has","had","having","do","does","did","doing","a","an","the","and","but","if","or","because","as","until","while","of","at","by","for","with","about","against","between","into","through","during","before","after","above","below","to","from","up","down","in","out","on","off","over","under","again","further","then","once","here","there","when","where","why","how","all","any","both","each","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","s","t","can","will","just","don","should","now"]);

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

// Emulate Python's feature extraction
function extractFeatures(text) {
    // Lowercase and split into words (basic tokenization)
    const rawWords = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    // Filter to keep only structural words
    const filteredWords = rawWords.filter(w => STOP_WORDS.has(w));
    
    // Generate 1-grams and 2-grams (bigrams and monograms, I guess?)
    let ngrams = [];
    for (let i = 0; i < filteredWords.length; i++) {
        ngrams.push(filteredWords[i]); // 1-gram
        if (i < filteredWords.length - 1) {
            ngrams.push(filteredWords[i] + " " + filteredWords[i+1]); // 2-gram
        }
    }
    return ngrams;
}

// Emulate scikit-learn's TF-IDF and SVM math
function predictLanguage(text) {
    if (!nliModel) return "Model not loaded yet.";
    
    const ngrams = extractFeatures(text);
    if (ngrams.length === 0) return "Not enough structural words found to analyze.";

    // Calculate Term Frequencies
    let tfCounts = {};
    ngrams.forEach(ngram => {
        if (nliModel.vocabulary[ngram] !== undefined) {
            tfCounts[ngram] = (tfCounts[ngram] || 0) + 1;
        }
    });

    // Apply IDF and L2 Normalization (scikit-learn default)
    let vector = new Array(nliModel.idf.length).fill(0);
    let sumSquares = 0;
    
    for (const [ngram, count] of Object.entries(tfCounts)) {
        const vocabIndex = nliModel.vocabulary[ngram];
        const tfIdfValue = count * nliModel.idf[vocabIndex];
        vector[vocabIndex] = tfIdfValue;
        sumSquares += tfIdfValue * tfIdfValue;
    }
    
    // Normalize the vector
    const norm = Math.sqrt(sumSquares);
    if (norm > 0) {
        for (let i = 0; i < vector.length; i++) {
            vector[i] = vector[i] / norm;
        }
    }

    // SVM Dot Product 
    let bestClass = "";
    let highestScore = -Infinity;

    for (let c = 0; c < nliModel.classes.length; c++) {
        let score = nliModel.intercept[c];
        for (let v = 0; v < vector.length; v++) {
            if (vector[v] !== 0) {
                score += vector[v] * nliModel.weights[c][v];
            }
        }
        
        if (score > highestScore) {
            highestScore = score;
            bestClass = nliModel.classes[c];
        }
    }

    return `Predicted Native Language: <strong>${bestClass}</strong>`;
}

document.getElementById('analyze-btn').addEventListener('click', () => {
    const text = document.getElementById('lab-input').value;
    const result = predictLanguage(text);
    document.getElementById('output-text').innerHTML = result;
});

// Initialize
loadModel();