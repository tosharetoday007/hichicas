/* Hichicas.com AI Widget JS | github.com/hichicas/widget */
(function(){

  var AFFILIATE_TAG = 'latestfotocom-20';
  var API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

  function amazonUrl(keyword){
    return 'https://www.amazon.com/s?k=' + encodeURIComponent(keyword.trim()) + '&tag=' + AFFILIATE_TAG;
  }

  function extractProductKeywords(text, userQuestion){
    var keywords = [];

    var ingredientMap = {
      'urea': 'urea body lotion',
      'ceramide': 'ceramide body lotion',
      'shea butter': 'shea butter lotion',
      'glycerin': 'glycerin moisturizer',
      'hyaluronic': 'hyaluronic acid body lotion',
      'retinol': 'retinol body lotion',
      'oatmeal': 'colloidal oatmeal lotion',
      'lactic acid': 'lactic acid body lotion',
      'niacinamide': 'niacinamide body lotion',
      'cocoa butter': 'cocoa butter lotion'
    };

    var brandMap = {
      'cetaphil': 'Cetaphil body lotion',
      'cerave': 'CeraVe body lotion',
      'nivea': 'Nivea body lotion',
      'vaseline': 'Vaseline body lotion',
      'dove': 'Dove body lotion',
      'aveeno': 'Aveeno body lotion',
      'eucerin': 'Eucerin body lotion',
      'palmer': "Palmer's cocoa butter lotion",
      'gold bond': 'Gold Bond body lotion',
      'jergens': 'Jergens body lotion',
      'neutrogena': 'Neutrogena body lotion',
      'lubriderm': 'Lubriderm daily moisture lotion'
    };

    var conditionMap = {
      'diabet': 'diabetic foot lotion',
      'eczema': 'eczema body lotion fragrance free',
      'psoriasis': 'psoriasis body lotion',
      'dry skin': 'dry skin body lotion',
      'cracked heel': 'cracked heel repair cream',
      'stretch mark': 'stretch mark cream',
      'pregnancy': 'pregnancy belly lotion',
      'sensitive': 'sensitive skin body lotion',
      'aging': 'anti aging body lotion',
      'itching': 'anti itch body lotion',
      'kidney': 'emollient body lotion dry skin',
      'thyroid': 'intensive moisturizer dry skin'
    };

    var combined = (text + ' ' + userQuestion).toLowerCase();

    for (var brand in brandMap) {
      if (combined.indexOf(brand) !== -1 && keywords.indexOf(brandMap[brand]) === -1) {
        keywords.push(brandMap[brand]);
      }
    }
    for (var cond in conditionMap) {
      if (combined.indexOf(cond) !== -1 && keywords.indexOf(conditionMap[cond]) === -1) {
        keywords.push(conditionMap[cond]);
      }
    }
    for (var ing in ingredientMap) {
      if (combined.indexOf(ing) !== -1 && keywords.indexOf(ingredientMap[ing]) === -1) {
        keywords.push(ingredientMap[ing]);
      }
    }

    if (keywords.length === 0) { keywords.push('best body lotion moisturizer'); }
    return keywords.slice(0, 3);
  }

  function getProductIcon(keyword){
    var k = keyword.toLowerCase();
    if (k.indexOf('foot') !== -1 || k.indexOf('heel') !== -1) return '🦵';
    if (k.indexOf('stretch') !== -1 || k.indexOf('pregnan') !== -1) return '🤰';
    if (k.indexOf('eczema') !== -1 || k.indexOf('sensitive') !== -1) return '🌿';
    if (k.indexOf('anti aging') !== -1 || k.indexOf('retinol') !== -1) return '✨';
    if (k.indexOf('diabet') !== -1) return '🩺';
    return '🧴';
  }

  function getProductDesc(keyword){
    var k = keyword.toLowerCase();
    if (k.indexOf('diabetic') !== -1) return 'Specially formulated for diabetic skin care';
    if (k.indexOf('eczema') !== -1) return 'Fragrance-free, dermatologist recommended';
    if (k.indexOf('heel') !== -1) return 'Fast-healing formula for cracked heels';
    if (k.indexOf('stretch') !== -1) return 'Popular for pregnancy skin care';
    if (k.indexOf('anti aging') !== -1) return 'Firms and smooths aging skin';
    if (k.indexOf('urea') !== -1) return 'Deep moisturizing with keratolytic action';
    if (k.indexOf('ceramide') !== -1) return "Restores the skin's natural barrier";
    if (k.indexOf('oatmeal') !== -1) return 'Soothes irritated and sensitive skin';
    return 'Top-rated moisturizer on Amazon';
  }

  function buildProductCards(keywords){
    if (!keywords || keywords.length === 0) return '';
    var html = '<div class="hc-products"><span class="hc-prod-label">🛒 Recommended Products on Amazon</span>';
    for (var i = 0; i < keywords.length; i++) {
      var kw = keywords[i];
      var url = amazonUrl(kw);
      var displayName = kw.replace(/\b\w/g, function(c){ return c.toUpperCase(); });
      html += '<a href="' + url + '" target="_blank" rel="noopener" class="hc-product-card">';
      html += '<span class="hc-product-icon">' + getProductIcon(kw) + '</span>';
      html += '<div class="hc-product-info">';
      html += '<span class="hc-product-name">' + displayName + '</span>';
      html += '<span class="hc-product-desc">' + getProductDesc(kw) + '</span>';
      html += '</div>';
      html += '<span class="hc-product-cta">Shop &rarr;</span>';
      html += '</a>';
    }
    html += '</div>';
    return html;
  }

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
    if (t) { t.parentNode.removeChild(t); }
  }

  function callAI(userMessage){
    var systemPrompt = 'You are the Hichicas AI Skin Care Assistant on hichicas.com. You are a friendly expert beauty and skin care advisor. Answer questions about body lotion, skin care products, ingredients, and skin conditions like dry skin, eczema, diabetes, psoriasis, pregnancy, aging, and sensitive skin. Also answer brand questions about Cetaphil, CeraVe, Nivea, Vaseline, Dove, Aveeno, Eucerin, Palmer\'s, Gold Bond, Jergens and Neutrogena. Rules: Be warm and conversational. Keep answers to 3-5 sentences. Always mention 1-3 relevant product types or brands. Mention ingredients like urea, ceramides, glycerin, shea butter, hyaluronic acid, retinol or colloidal oatmeal when relevant. For medical conditions always add: Please consult your doctor for personalized medical advice. Do not use markdown headers. End with a brief encouraging note. Be AdSense-safe always.';

    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-request-proxy': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    }).then(function(response){
      return response.json();
    }).then(function(data){
      if (data && data.content && data.content[0]) {
        return data.content[0].text;
      }
      return 'I could not process that right now. Please try again in a moment!';
    });
  }

  function sendMessage(text){
    if (!text || !text.trim()) return;
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
      var productHtml = buildProductCards(keywords);
      var formatted = aiText.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
      addMsg('ai', formatted + productHtml);
      btn.disabled = false;
      input.focus();
    }).catch(function(){
      removeTyping();
      addMsg('ai', '😟 Sorry, something went wrong. Please try again!');
      btn.disabled = false;
      input.focus();
    });
  }

  document.getElementById('hcSendBtn').addEventListener('click', function(){
    sendMessage(document.getElementById('hcInput').value.trim());
  });

  document.getElementById('hcInput').addEventListener('keydown', function(e){
    if (e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      sendMessage(this.value.trim());
    }
  });

  document.getElementById('hcInput').addEventListener('input', function(){
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  document.getElementById('hcSugPills').addEventListener('click', function(e){
    if (e.target.className.indexOf('hc-sug-pill') !== -1){
      sendMessage(e.target.textContent);
    }
  });

})();
