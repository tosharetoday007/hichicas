/* Hichicas.com AI Widget JS | github.com/tosharetoday007/hichicas */
(function(){

  var AFFILIATE_TAG = 'latestfotocom-20';
  var API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

  /* ============================================================
     STEP 1 — Read page context: title, labels, first 300 chars
  ============================================================ */
  function getPageContext(){
    // Article title
    var title = '';
    var titleEl = document.querySelector('.post-title') ||
                  document.querySelector('h1.entry-title') ||
                  document.querySelector('h3.post-title') ||
                  document.querySelector('h1') ||
                  document.querySelector('title');
    if(titleEl){ title = titleEl.textContent.trim(); }

    // Blogger labels (tags) — shown as links in post footer
    var labelEls = document.querySelectorAll('.post-labels a, .labels a, a[rel="tag"]');
    var labels = [];
    for(var i = 0; i < labelEls.length; i++){
      labels.push(labelEls[i].textContent.trim().toLowerCase());
    }

    // First 300 characters of article body text
    var bodyText = '';
    var bodyEl = document.querySelector('.post-body') ||
                 document.querySelector('.entry-content') ||
                 document.querySelector('article');
    if(bodyEl){ bodyText = bodyEl.textContent.replace(/\s+/g,' ').trim().substring(0, 300); }

    return {
      title: title.toLowerCase(),
      labels: labels,
      body: bodyText.toLowerCase()
    };
  }

  /* ============================================================
     STEP 2 — Match page context to question bank
  ============================================================ */
  var questionBank = [
    // Brand questions
    { keywords:['cetaphil'],         question:'Is Cetaphil good for dry skin?'          },
    { keywords:['cetaphil'],         question:'Cetaphil lotion vs cream — which is better?' },
    { keywords:['cerave'],           question:'Which CeraVe lotion is best for dry skin?' },
    { keywords:['cerave'],           question:'Is CeraVe good for sensitive skin?'       },
    { keywords:['nivea'],            question:'Which Nivea body lotion is best?'         },
    { keywords:['nivea'],            question:'Is Nivea lotion good for very dry skin?'  },
    { keywords:['vaseline'],         question:'How to use Vaseline as a body moisturizer?' },
    { keywords:['dove'],             question:'Is Dove body lotion good for daily use?'  },
    { keywords:['aveeno'],           question:'Is Aveeno lotion good for eczema?'        },
    { keywords:['eucerin'],          question:'Is Eucerin good for extremely dry skin?'  },
    { keywords:['palmer','palmers'], question:"Palmer's cocoa butter — what is it good for?" },
    { keywords:['gold bond'],        question:'What does Gold Bond lotion do?'           },
    { keywords:['jergens'],          question:'Is Jergens lotion good for daily use?'    },
    { keywords:['neutrogena'],       question:'Which Neutrogena lotion is best?'         },
    { keywords:['lubriderm'],        question:'Is Lubriderm good for sensitive skin?'    },

    // Condition questions
    { keywords:['diabet','diabetic'],question:'What is the best lotion for diabetic skin?' },
    { keywords:['diabet','diabetic'],question:'Can diabetics use regular body lotion?'   },
    { keywords:['diabet','diabetic'],question:'Best lotion for diabetic feet?'           },
    { keywords:['eczema'],           question:'What body lotion is best for eczema?'     },
    { keywords:['eczema'],           question:'Should I use fragrance-free lotion for eczema?' },
    { keywords:['psoriasis'],        question:'What lotion helps with psoriasis?'        },
    { keywords:['stretch mark'],     question:'Does lotion really help stretch marks?'   },
    { keywords:['stretch mark','pregnan'], question:'Best lotion for pregnancy stretch marks?' },
    { keywords:['pregnan'],          question:'Is it safe to use body lotion during pregnancy?' },
    { keywords:['pregnan'],          question:'What ingredients to avoid in lotion during pregnancy?' },
    { keywords:['crack','heel'],     question:'How to fix cracked heels fast?'           },
    { keywords:['crack','heel'],     question:'Best cream for cracked heels?'            },
    { keywords:['sensitive'],        question:'What lotion is best for sensitive skin?'  },
    { keywords:['aging','anti-aging','wrinkle'], question:'Does body lotion help with aging skin?' },
    { keywords:['aging','anti-aging','wrinkle'], question:'What ingredients fight aging in body lotion?' },
    { keywords:['kidney','renal'],   question:'What lotion is safe for kidney disease patients?' },
    { keywords:['itch','itching'],   question:'What body lotion stops itching fast?'     },
    { keywords:['dark spot','hyperpigment'], question:'Can body lotion help with dark spots?' },

    // Ingredient questions
    { keywords:['urea'],             question:'What does urea do in body lotion?'        },
    { keywords:['urea'],             question:'Is urea lotion safe for daily use?'       },
    { keywords:['ceramide'],         question:'Why are ceramides important in lotion?'   },
    { keywords:['shea butter'],      question:'Is shea butter lotion good for dry skin?' },
    { keywords:['glycerin'],         question:'What does glycerin do in body lotion?'    },
    { keywords:['hyaluronic'],       question:'Can hyaluronic acid be used on the body?' },
    { keywords:['retinol'],          question:'Is retinol body lotion good for aging skin?' },
    { keywords:['oatmeal','colloidal'],question:'What is colloidal oatmeal lotion good for?' },
    { keywords:['lactic acid'],      question:'What does lactic acid do in body lotion?' },
    { keywords:['niacinamide'],      question:'What are the benefits of niacinamide in lotion?' },
    { keywords:['cocoa butter'],     question:'Is cocoa butter lotion good for dry skin?' },
    { keywords:['spf','sunscreen'],  question:'Should I use a lotion with SPF daily?'    },

    // General questions (always available as fallback)
    { keywords:['lotion','moistur','skin','body','cream','dry'], question:'When is the best time to apply body lotion?' },
    { keywords:['lotion','moistur','skin','body','cream','dry'], question:'How much body lotion should I use?'          },
    { keywords:['lotion','moistur','skin','body','cream','dry'], question:'Should I apply lotion before or after getting dressed?' },
    { keywords:['lotion','moistur','skin','body','cream','dry'], question:'What is the difference between lotion and cream?' },
    { keywords:['lotion','moistur','skin','body','cream','dry'], question:'How do I choose the right body lotion for my skin?' }
  ];

  function getDynamicQuestions(){
    var ctx = getPageContext();
    var combined = ctx.title + ' ' + ctx.labels.join(' ') + ' ' + ctx.body;
    var matched = [];
    var seen = {};

    // First pass — exact keyword matches
    for(var i = 0; i < questionBank.length; i++){
      var entry = questionBank[i];
      var hit = false;
      for(var j = 0; j < entry.keywords.length; j++){
        if(combined.indexOf(entry.keywords[j]) !== -1){ hit = true; break; }
      }
      if(hit && !seen[entry.question]){
        seen[entry.question] = true;
        matched.push(entry.question);
      }
      if(matched.length >= 8){ break; }
    }

    // If less than 5 matched, fill with general fallbacks
    if(matched.length < 5){
      var fallbacks = [
        'Best lotion for dry skin?',
        'Lotion for diabetic feet?',
        'Which Nivea lotion is best?',
        'Cetaphil vs CeraVe — which is better?',
        'Best lotion for eczema?',
        'Best lotion during pregnancy?',
        'How to fix cracked heels?',
        "Palmer's for stretch marks?"
      ];
      for(var f = 0; f < fallbacks.length; f++){
        if(matched.length >= 8){ break; }
        if(!seen[fallbacks[f]]){
          seen[fallbacks[f]] = true;
          matched.push(fallbacks[f]);
        }
      }
    }

    return matched.slice(0, 8);
  }

  /* ============================================================
     STEP 3 — Build the widget HTML dynamically
  ============================================================ */
  function buildWidget(){
    var questions = getDynamicQuestions();
    var pillsHtml = '';
    for(var i = 0; i < questions.length; i++){
      pillsHtml += '<span class="hc-sug-pill">' + questions[i] + '</span>';
    }

    var ctx = getPageContext();
    var topicHint = ctx.title ? ' about ' + ctx.title : '';

    var wrap = document.getElementById('hcAiWidget');
    if(!wrap){ return; }

    wrap.innerHTML =
      '<div class="hc-ai-header">' +
        '<div class="hc-ai-avatar">&#129302;</div>' +
        '<div class="hc-ai-header-text">' +
          '<h3>Ask Hichicas AI Assistant</h3>' +
          '<p>Skin care advice &amp; product recommendations &#8212; powered by AI</p>' +
        '</div>' +
        '<div class="hc-ai-status"><div class="hc-ai-dot"></div> Online</div>' +
      '</div>' +
      '<div class="hc-suggestions">' +
        '<span class="hc-sug-label">&#128161; Questions about this article</span>' +
        '<div class="hc-sug-pills" id="hcSugPills">' + pillsHtml + '</div>' +
      '</div>' +
      '<div class="hc-chat-area" id="hcChatArea">' +
        '<div class="hc-msg ai">' +
          '<div class="hc-msg-avatar">&#129302;</div>' +
          '<div class="hc-msg-bubble">' +
            '&#128075; <strong>Hello! I am the Hichicas AI Assistant.</strong><br/><br/>' +
            'I have read this article' + topicHint + '. Ask me anything about skin care, ingredients, or products &#8212; I will also suggest the best options on Amazon! &#127749;' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="hc-input-wrap">' +
        '<div class="hc-input-row">' +
          '<textarea class="hc-input" id="hcInput" placeholder="Ask about this article, skin care, products..." rows="1"></textarea>' +
          '<button class="hc-send-btn" id="hcSendBtn" title="Send">&#10148;</button>' +
        '</div>' +
        '<div class="hc-input-footer">' +
          '<span>Powered by Claude AI &amp; Amazon</span>' +
          '<div class="hc-amazon-badge">&#128722; Amazon Affiliate Links</div>' +
        '</div>' +
      '</div>';
  }

  /* ============================================================
     STEP 4 — Amazon product logic
  ============================================================ */
  function amazonUrl(keyword){
    return 'https://www.amazon.com/s?k=' + encodeURIComponent(keyword.trim()) + '&tag=' + AFFILIATE_TAG;
  }

  function extractProductKeywords(text, userQuestion){
    var keywords = [];
    var ingredientMap = {
      'urea':'urea body lotion','ceramide':'ceramide body lotion',
      'shea butter':'shea butter lotion','glycerin':'glycerin moisturizer',
      'hyaluronic':'hyaluronic acid body lotion','retinol':'retinol body lotion',
      'oatmeal':'colloidal oatmeal lotion','lactic acid':'lactic acid body lotion',
      'niacinamide':'niacinamide body lotion','cocoa butter':'cocoa butter lotion'
    };
    var brandMap = {
      'cetaphil':'Cetaphil body lotion','cerave':'CeraVe body lotion',
      'nivea':'Nivea body lotion','vaseline':'Vaseline body lotion',
      'dove':'Dove body lotion','aveeno':'Aveeno body lotion',
      'eucerin':'Eucerin body lotion','palmer':"Palmer's cocoa butter lotion",
      'gold bond':'Gold Bond body lotion','jergens':'Jergens body lotion',
      'neutrogena':'Neutrogena body lotion','lubriderm':'Lubriderm daily moisture lotion'
    };
    var conditionMap = {
      'diabet':'diabetic foot lotion','eczema':'eczema body lotion fragrance free',
      'psoriasis':'psoriasis body lotion','dry skin':'dry skin body lotion',
      'cracked heel':'cracked heel repair cream','stretch mark':'stretch mark cream',
      'pregnancy':'pregnancy belly lotion','sensitive':'sensitive skin body lotion',
      'aging':'anti aging body lotion','itching':'anti itch body lotion',
      'kidney':'emollient body lotion dry skin'
    };
    var combined = (text + ' ' + userQuestion).toLowerCase();
    for(var b in brandMap){ if(combined.indexOf(b) !== -1 && keywords.indexOf(brandMap[b]) === -1){ keywords.push(brandMap[b]); } }
    for(var c in conditionMap){ if(combined.indexOf(c) !== -1 && keywords.indexOf(conditionMap[c]) === -1){ keywords.push(conditionMap[c]); } }
    for(var ing in ingredientMap){ if(combined.indexOf(ing) !== -1 && keywords.indexOf(ingredientMap[ing]) === -1){ keywords.push(ingredientMap[ing]); } }
    if(keywords.length === 0){ keywords.push('best body lotion moisturizer'); }
    return keywords.slice(0,3);
  }

  function getProductIcon(k){
    k = k.toLowerCase();
    if(k.indexOf('foot') !== -1 || k.indexOf('heel') !== -1){ return '🦵'; }
    if(k.indexOf('stretch') !== -1 || k.indexOf('pregnan') !== -1){ return '🤰'; }
    if(k.indexOf('eczema') !== -1 || k.indexOf('sensitive') !== -1){ return '🌿'; }
    if(k.indexOf('anti aging') !== -1 || k.indexOf('retinol') !== -1){ return '✨'; }
    if(k.indexOf('diabet') !== -1){ return '🩺'; }
    return '🧴';
  }

  function getProductDesc(k){
    k = k.toLowerCase();
    if(k.indexOf('diabetic') !== -1){ return 'Specially formulated for diabetic skin care'; }
    if(k.indexOf('eczema') !== -1){ return 'Fragrance-free, dermatologist recommended'; }
    if(k.indexOf('heel') !== -1){ return 'Fast-healing formula for cracked heels'; }
    if(k.indexOf('stretch') !== -1){ return 'Popular for pregnancy skin care'; }
    if(k.indexOf('anti aging') !== -1){ return 'Firms and smooths aging skin'; }
    if(k.indexOf('urea') !== -1){ return 'Deep moisturizing with keratolytic action'; }
    if(k.indexOf('ceramide') !== -1){ return "Restores the skin's natural barrier"; }
    if(k.indexOf('oatmeal') !== -1){ return 'Soothes irritated and sensitive skin'; }
    return 'Top-rated moisturizer on Amazon';
  }

  function buildProductCards(keywords){
    if(!keywords || keywords.length === 0){ return ''; }
    var html = '<div class="hc-products"><span class="hc-prod-label">🛒 Recommended Products on Amazon</span>';
    for(var i = 0; i < keywords.length; i++){
      var kw = keywords[i];
      var displayName = kw.replace(/\b\w/g, function(c){ return c.toUpperCase(); });
      html += '<a href="' + amazonUrl(kw) + '" target="_blank" rel="noopener" class="hc-product-card">';
      html += '<span class="hc-product-icon">' + getProductIcon(kw) + '</span>';
      html += '<div class="hc-product-info"><span class="hc-product-name">' + displayName + '</span>';
      html += '<span class="hc-product-desc">' + getProductDesc(kw) + '</span></div>';
      html += '<span class="hc-product-cta">Shop &rarr;</span></a>';
    }
    html += '</div>';
    return html;
  }

  /* ============================================================
     STEP 5 — Chat logic
  ============================================================ */
  function addMsg(role, html){
    var area = document.getElementById('hcChatArea');
    var div = document.createElement('div');
    div.className = 'hc-msg ' + role;
    var icon = (role === 'ai') ? '🤖' : '👤';
    div.innerHTML = '<div class="hc-msg-avatar">' + icon + '</div><div class="hc-msg-bubble">' + html + '</div>';
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    return div;
  }

  function showTyping(){
    var area = document.getElementById('hcChatArea');
    var div = document.createElement('div');
    div.className = 'hc-msg ai hc-typing';
    div.id = 'hcTyping';
    div.innerHTML = '<div class="hc-msg-avatar">🤖</div><div class="hc-msg-bubble"><div class="hc-typing-dots"><span></span><span></span><span></span></div></div>';
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
  }

  function removeTyping(){
    var t = document.getElementById('hcTyping');
    if(t){ t.parentNode.removeChild(t); }
  }

  function callAI(userMessage){
    var ctx = getPageContext();
    var systemPrompt = 'You are the Hichicas AI Skin Care Assistant on hichicas.com. ' +
      'The visitor is reading an article titled: "' + ctx.title + '". ' +
      'Article labels/tags: ' + (ctx.labels.length ? ctx.labels.join(', ') : 'general skin care') + '. ' +
      'You are a friendly expert beauty and skin care advisor. Answer questions about body lotion, skin care products, ingredients, and skin conditions. ' +
      'Be warm and conversational. Keep answers to 3-5 sentences. Always mention 1-3 relevant product types or brands. ' +
      'For medical conditions always add: Please consult your doctor for personalized medical advice. ' +
      'Do not use markdown headers. End with a brief encouraging note. Be AdSense-safe always.';

    return fetch('https://script.google.com/macros/s/AKfycbwX5TIkIg55a0aM5cDv7ESS20xlBiC6qPc0ZEVuifSLVm6BnlkKuf0jo-JPIflccPCY/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    }).then(function(r){ return r.json(); })
    .then(function(data){
      if(data && data.content && data.content[0]){ return data.content[0].text; }
      return 'I could not process that right now. Please try again!';
    });
  }

  function sendMessage(text){
    if(!text || !text.trim()){ return; }
    var btn = document.getElementById('hcSendBtn');
    var input = document.getElementById('hcInput');
    addMsg('user', text);
    input.value = '';
    input.style.height = 'auto';
    btn.disabled = true;
    showTyping();
    callAI(text).then(function(aiText){
      removeTyping();
      var keywords = extractProductKeywords(aiText, text);
      var formatted = aiText.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
      addMsg('ai', formatted + buildProductCards(keywords));
      btn.disabled = false;
      input.focus();
    }).catch(function(){
      removeTyping();
      addMsg('ai','😟 Sorry, something went wrong. Please try again!');
      btn.disabled = false;
      input.focus();
    });
  }

  /* ============================================================
     STEP 6 — Init
  ============================================================ */
  function init(){
    buildWidget();

    document.getElementById('hcSendBtn').addEventListener('click', function(){
      sendMessage(document.getElementById('hcInput').value.trim());
    });

    document.getElementById('hcInput').addEventListener('keydown', function(e){
      if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(this.value.trim()); }
    });

    document.getElementById('hcInput').addEventListener('input', function(){
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    document.getElementById('hcSugPills').addEventListener('click', function(e){
      if(e.target.className.indexOf('hc-sug-pill') !== -1){ sendMessage(e.target.textContent); }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
