function process_text({ascii_wanted=false}){return string=>{
  //BY + (C) Greg Abbott V 2024-11-20
  function emoji_to_description(string) {
    const map={
    "🙂":"Slightly Smiling Face",
    "😀":"Grinning Face",
    "😁":"Beaming Face with Smiling Eyes",
    "😂":"Face with Tears of Joy",
    "😃":"Grinning Face with Big Eyes",
    "😄":"Grinning Face with Smiling Eyes",
    "😅":"Grinning Face with Sweat",
    "😆":"Grinning Squinting Face",
    "😉":"Winking Face",
    "😊":"Smiling Face with Smiling Eyes",
    "😇":"Smiling Face with Halo",
    "🥰":"Smiling Face with Hearts",
    "😍":"Smiling Face with Heart-Eyes",
    "😋":"Face Savoring Food",
    "😎":"Smiling Face with Sunglasses",
    "😏":"Smirking Face",
    "😒":"Unamused Face",
    "😞":"Disappointed Face",
    "😔":"Pensive Face",
    "😟":"Worried Face",
    "😠":"Angry Face",
    "😡":"Pouting Face",
    "😢":"Crying Face",
    "😭":"Loudly Crying Face",
    "😤":"Face with Steam From Nose",
    "😩":"Weary Face",
    "😬":"Grimacing Face",
    "😱":"Face Screaming in Fear",
    "😳":"Flushed Face",
    "😵":"Dizzy Face",
    "😶":"Face Without Mouth",
    "🤔":"Thinking Face",
    "🤗":"Hugging Face",
    "🤩":"Star-Struck",
    "🥳":"Party Face"
    }
    //Regex for the Emoji character range
    return string.replace(
      /[\u{1F600}-\u{1F64F}]/gu, 
      emoji=>map[emoji]
        ?`(Emoji of ${map[emoji]})`
        :'(Unknown Emoji)'
    )
  }
  function unring_characters(s){
    const n={
      '⓪⓿':'0','①❶':'1','②❷':'2','③❸':'3','④❹':'4',
      '⑤❺':'5','⑥❻':'6','⑦❼':'7','⑧❽':'8','⑨❾':'9',
      '⑩❿':'10','⑪⓫':'11','⑫⓬':'12','⑬⓭':'13','⑭⓮':'14',
      '⑮⓯':'15','⑯⓰':'16','⑰⓱':'17','⑱⓲':'18','⑲⓳':'19',
      '⑳⓴':'20','⧁':'>','⧀':'<',
      'Ⓐ':'A','Ⓑ':'B','Ⓒ':'C','Ⓓ':'D','Ⓔ':'E','Ⓕ':'F',
      'Ⓖ':'G','Ⓗ':'H','Ⓘ':'I','Ⓙ':'J','Ⓚ':'K','Ⓛ':'L',
      'Ⓜ':'M','Ⓝ':'N','Ⓞ':'O','Ⓟ':'P','Ⓠ':'Q','Ⓡ':'R',
      'Ⓢ':'S','Ⓣ':'T','Ⓤ':'U','Ⓥ':'V','Ⓦ':'W','Ⓧ':'X',
      'Ⓨ':'Y','Ⓩ':'Z','ⓐ':'a','ⓑ':'b','ⓒ':'c','ⓓ':'d',
      'ⓔ':'e','ⓕ':'f','ⓖ':'g','ⓗ':'h','ⓘ':'i','ⓙ':'j',
      'ⓚ':'k','ⓛ':'l','ⓜ':'m','ⓝ':'n','ⓞ':'o','ⓟ':'p',
      'ⓠ':'q','ⓡ':'r','ⓢ':'s','ⓣ':'t','ⓤ':'u','ⓥ':'v',
      'ⓦ':'w','ⓧ':'x','ⓨ':'y','ⓩ':'z'
    },
    t=new RegExp(`[${Object.keys(n).join("")}]`,"g");
    return s.replace(t, (e) => {
      for (let t in n) if (t.includes(e)) return `(${n[t]})`
    })
  }
  function to_latin(e){
    //swap characters with diacritics for ASCII look-alikes
    const n={
      '█':'[]','ÀÁÂÃÄÅĀĂĄǍǞǠǺȀȂȦȺḀẠẢẤẦẨẪẬẮẰẲẴẶⒶⱯＡ':'A',
      'Ꜳ':'AA','ÆǢǼ':'AE','Ꜵ':'AO','Ꜷ':'AU','ꜸꜺ':'AV',
      'Ꜽ':'AY','ƁƂɃḂḄḆⒷＢ':'B','ÇĆĈĊČƇȻḈⒸꜾＣ':'C',
      'ÐĎĐƉƊƋḊḌḎḐḒⒹꝹＤ':'D','ǄǅǱ':'DZ','ǅǲ':'Dz',
      'ÈÉÊËĒĔĖĘĚƎƐȄȆȨḔḖḘḚḜẸẺẼẾỀỂỄỆⒺＥ':'E','ƑḞⒻꝻＦ':'F',
      'ĜĞĠĢƓǤǦǴḠⒼꝽꝾꞠＧ':'G','ĤĦȞḢḤḦḨḪⒽⱧⱵꞍＨ':'H',
      'ÌÍÎÏĨĪĬĮİƗǏȈȊḬḮỈỊⒾＩ':'I','ĴǰɈⒿＪ':'J',
      'ĶƘǨḰḲḴⓀⱩꝀꝂꝄꞢＫ':'K','ĹĻĽĿŁȽḶḸḺḼⓁⱠⱢꝆꝈꞀＬ':'L',
      'Ǉǈ':'LJ','ǈ':'Lj','ƜḾṀṂⓂⱮＭ':'M',
      'ÑŃŅŇŊƝǸȠṄṆṈṊⓃꞐꞤＮ':'N','Ǌǋ':'NJ','ǋ':'Nj',
      'ÒÓÔÕÖØŌŎŐƆƟƠǑǪǬǾȌȎȪȬȮȰṌṎṐṒỌỎỐỒỔỖỘỚỜỞỠỢⓄꝊꝌＯ':'O',
      'Ƣ':'OI','Ꝏ':'OO','Ȣ':'OU','ƤṔṖⓅⱣꝐꝒꝔＰ':'P',
      'ɊⓆꝖꝘＱ':'Q','ŔŖŘȐȒɌṘṚṜṞⓇⱤꝚꞂꞦＲ':'R',
      'ŚŜŞŠȘṠṢṤṦṨẞⓈⱾꞄꞨＳ':'S','ŢŤŦƬƮȚȾṪṬṮṰⓉꞆＴ':'T',
      'Ꜩ':'TZ','ÙÚÛÜŨŪŬŮŰŲƯǓǕǗǙǛȔȖɄṲṴṶṸṺỤỦỨỪỬỮỰⓊＵ':'U',
      'ƲɅṼṾⓋꝞＶ':'V','Ꝡ':'VY','ŴẀẂẄẆẈⓌⱲＷ':'W','ẊẌⓍＸ':'X',
      'ÝŶŸƳȲɎẎỲỴỶỸỾⓎＹ':'Y','ŹŻŽƵȤẐẒẔⓏⱫⱿꝢＺ':'Z',
      'àáâãäåāăąǎǟǡǻȁȃȧɐḁẚạảấầẩẫậắằẳẵặⓐⱥａ':'a','ꜳ':'aa',
      'æǣǽ':'ae','ꜵ':'ao','ꜷ':'au','ꜹꜻ':'av','ꜽ':'ay',
      'ƀƃɓḃḅḇⓑｂ':'b','çćĉċčƈȼḉↄⓒꜿｃ':'c',
      'ðďđƌɖɗḋḍḏḑḓⓓꝺｄ':'d','ǆǳ':'dz',
      'èéêëēĕėęěǝȅȇȩɇɛḕḗḙḛḝẹẻẽếềểễệⓔｅ':'e','ƒḟⓕꝼｆ':'f',
      'ĝğġģǥǧǵɠᵹḡⓖꝿꞡｇ':'g','ĥħȟɥḣḥḧḩḫẖⓗⱨⱶｈ':'h',
      'ƕ':'hv','ìíîïĩīĭįıǐȉȋɨḭḯỉịⓘｉ':'i','ĵǰɉⓙｊ':'j',
      'ķƙǩḱḳḵⓚⱪꝁꝃꝅꞣｋ':'k','ĺļľŀłſƚɫḷḹḻḽⓛⱡꝇꝉꞁｌ':'l','ǉ':'lj',
      'ɯɱḿṁṃⓜｍ':'m','ñńņňŉŋƞǹɲṅṇṉṋⓝꞑꞥｎ':'n','ǌ':'nj',
      'òóôõöøōŏőơǒǫǭǿȍȏȫȭȯȱɔɵṍṏṑṓọỏốồổỗộớờởỡợⓞꝋꝍｏ':'o',
      'ƣ':'oi','ȣ':'ou','ꝏ':'oo','ƥᵽṕṗⓟꝑꝓꝕｐ':'p',
      'ɋⓠꝗꝙｑ':'q','ŕŗřȑȓɍɽṙṛṝṟⓡꝛꞃꞧｒ':'r',
      'ßśŝşšșȿṡṣṥṧṩẛⓢꞅꞩｓ':'s','ţťŧƭțʈṫṭṯṱẗⓣⱦꞇｔ':'t',
      'ꜩ':'tz','ùúûüũūŭůűųưǔǖǘǚǜȕȗʉṳṵṷṹṻụủứừửữựⓤｕ':'u',
      'ʋʌṽṿⓥꝟｖ':'v','ꝡ':'vy','ŵẁẃẅẇẉẘⓦⱳｗ':'w','ẋẍⓧｘ':'x',
      'ýÿŷƴȳɏẏẙỳỵỷỹỿⓨｙ':'y','źżžƶȥɀẑẓẕⓩⱬꝣｚ':'z','Œ':'OE',
      'ẞ':'SS','œ':'oe','ß':'ss'
    },
    t = new RegExp(`[${Object.keys(n).join("")}]`, "g")
    return e.replace(t, (e) => {
        for (let t in n) if (t.includes(e)) return n[t]
    })
  }
  function to_most_similar_ascii_character(s) {
    //v2024_1114_1114
    const quote_double_curly_open=`\u201c`,
    quote_double_curly_shut=`\u201d`,
    quote_single_curly_open=`\u2018`,
    quote_single_curly_shut=`\u2019`,
    ellipses_glyph=`\u2026`,
    bullet = `\u2022`,
    copyright_symbol = `\u00a9`,
    registered_symbol = `\u00ae`,
    trademark_symbol = '\u2122',
    en_dash = '\u2013',
    em_dash = '\u2014',
    replacements = {
      [quote_double_curly_open]: '"', 
      [quote_double_curly_shut]: '"', 
      [quote_single_curly_open]: "'", 
      [quote_single_curly_shut]: "'",
      [en_dash]: '-', 
      [em_dash]: '-', 
      [ellipses_glyph]: '...',
      '£': 'GBP',
      '«': '"', '»': '"', '‹': "'", '›': "'",
      [bullet]: '*',
      [copyright_symbol]: '(c)',
      [registered_symbol]: '(R)',
      [trademark_symbol]: '(TM)',
    }
    const pattern = new RegExp(
      `[${Object.keys(replacements).join('')}]`, 'g'
    )
    return s.replace(pattern, char => replacements[char] || '')
  }
  function make_spaces_normal(s){
    let non_breaking_space='\u00A0'
    let en_space='\u2002'
    let em_space='\u2003'
    let thin_space='\u2009'
    let zero_width_space=`\u200B`
    let zero_width_non_joiner=`\u200C`
    let zero_width_joiner=`\u200D`
    let space=' '
    let blank=''
    const replacements = {
      [non_breaking_space]: space,
      [en_space] : space,
      [em_space]: space, 
      [thin_space]: space,
      //NON spaces
      [zero_width_space]:blank,
      [zero_width_non_joiner]:blank,
      [zero_width_joiner]:blank
    }
    const pattern = new RegExp(
      `[${Object.keys(replacements).join('')}]`, 'g'
    )
    return s.replace(pattern, char => replacements[char] || '')
  }
  function remove_invisible_ascii_characters(input) {
    // preserve: space(32),tab(9),line breaks: LF(10),CR(13)
    return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }
  function remove_non_ascii_characters(s) {
    return s.replace(/[^\x00-\x7F]/g, '');//ascii range
  }
  function start_sentences_with_one_space(s){
    return s.replace(/([!\.?]) {2,}/g,'$1 ')
  }
  function remove_invisibles_on_blank_lines(s){
    return s.replace(/\n[ \t]+\n/g,'\n\n')
  }
  function replace_consecutive_blank_lines_with_one(s){
    return s.replace(/\n{3,}/g,'\n\n')
  }
  function convert_to_ascii(s){return chain(
      s,
      to_most_similar_ascii_character,//emDash -> dash
      unring_characters,//Ⓖ->(G)
      emoji_to_description,//😀=>(Emoji of Grinning Face)
      // only safe for English text:
      to_latin,//é->e å->a
      remove_non_ascii_characters, //世界 (world)->''
  )}
  function only_if(condition,fn){return X=>condition?fn(X):X}
  function chain(c,...n){return n.reduce(((c,n)=>n(c)),c)}
  //STEPS:
  return chain(string,
    make_spaces_normal,//non breaking & other spaces to regular
    remove_invisible_ascii_characters,
    remove_invisibles_on_blank_lines,
    replace_consecutive_blank_lines_with_one,
    start_sentences_with_one_space,//instead of many
    only_if(ascii_wanted,convert_to_ascii)
  )
}}