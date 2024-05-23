let finalOutput = "";
let ta = document.getElementById("textInput");
let out = document.getElementById("output")
let menu1 = document.getElementById("menu1")
let menu2 = document.getElementById("menu2")
let menu3 = document.getElementById("menu3")
let scrollTopBtn = document.getElementById("scrollTopBtn");
let al = document.getElementById("alert");

// let inputChanged = false;

// ta.addEventListener("input", () => {
//   inputChanged = true;
//   requestAnimationFrame(checkInputChange);
// });

// function checkInputChange() {
//   if (inputChanged) {
//     inputChanged = false;
//     formatText();
//   }
// }

document.querySelectorAll('input[name="lang"]').forEach((radio) => {
    radio.addEventListener("change", formatText);
});

function space() {
    const input = ta.value.trim();
    let isInString = false;
    let result = "";

    for (let i = 0; i < input.length; i++) {
        let char = input[i];

        if (char === '"' && (i === 0 || input[i - 1] !== "\\")) {
            isInString = !isInString;
        }

        if (isInString || (!isInString && !/\s/.test(char))) {
            result += char;
        }
    }
    ta.value = result;
    formatText();
}

function formatText() {
    const input = ta.value.trim();
    let selected = document.querySelector('input[name="lang"]:checked');
    if (selected.value == "json") {
        formatJSON(input);
    } else if (selected.value == "xml") {
        formatXML(input);
    }
    const isVisible = !!input;
    [menu1, menu2, menu3].forEach(menu => menu.style.display = isVisible ? "block" : "none");
    finalOutput = out.innerText;
}

// function formatJSON(input) {
//   let formattedText = "",
//     indentLevel = 0,
//     indent = "  ",
//     last = false,
//     lastChar = "";
//   for (let i = 0; i < input.length; i++) {
//     let char = input[i];
//     if (last && (char == " " || char == "" || char == "\n" || char == "\r")) {
//       continue;
//     } else {
//       last = false;
//     }
//     if (char === "{" || char === "[") {
//       last = true;
//       formattedText += char + "\n" + indent.repeat(Math.max(0, ++indentLevel));
//       lastChar = char.trim();
//     } else if (char === "}" || char === "]") {
//       formattedText += "\n" + indent.repeat(Math.max(0, --indentLevel)) + char;
//       last = true;
//       if (
//         input[i + 1] &&
//         input[i + 1] != "," &&
//         input[i + 1] != "}" &&
//         input[i + 1] != "]" &&
//         lastChar.trim() != "" &&
//         lastChar.trim() != "}" &&
//         lastChar.trim() != "]"
//       ) {
//         formattedText += "\n";
//       }
//       lastChar = char.trim();
//     } else if (char === ",") {
//       last = true;
//       formattedText += char + "\n" + indent.repeat(Math.max(0, indentLevel));
//       lastChar = char.trim();
//     } else if (char !== "\n" && char !== "\r") {
//       formattedText += char;
//       lastChar = char.trim();
//     }
//   }
//   out.innerHTML = syntaxHighlightJSON(formattedText);
//   addCollapsibleListeners();
// }

function formatJSON(text) {
    let formattedText = "";
    let indentLevel = 0;
    const indent = "  ";
    let last = false;
    let lastChar = false;
    let inString = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (last && /\s/.test(char)) {
        continue;
      }
      if(inString && !(/\s/.test(char))) {
        if(char == `"`) inString = false
        formattedText += char;
        continue
      }
      last = false;
      if(char === `"`) inString = true
      if (char === "{" || char === "[") {
        if(lastChar){
          formattedText += "\n";
          lastChar = false
        }
        last = true;
        formattedText += `${char}\n${indent.repeat(
          Math.max(0, ++indentLevel)
        )}`;
      } else if (char === "}" || char === "]") {
        formattedText += `\n${indent.repeat(
          Math.max(0, --indentLevel)
        )}${char}`;
        last = true;
        
        
        lastChar = true;
      } else if (char === ",") {
        last = true;
        formattedText += `${char}\n${indent.repeat(
          Math.max(0, indentLevel)
        )}`;
        lastChar = false
      } else if (!/[\n\r]/.test(char)) {
        if(lastChar){
          formattedText += "\n";
          lastChar = false
        }
        formattedText += char;
      }
    }
    out.innerHTML = syntaxHighlightJSON(formattedText);
    addCollapsibleListeners();
}


function formatXML(input) {
    let formattedText = "",
        indentLevel = 0,
        indent = "    ";
    input.split(/>\s*</).forEach((node) => {
        if (node.match(/^\/\w/)) indentLevel--;
        formattedText +=
            indent.repeat(Math.max(0, indentLevel)) + "<" + node + ">\n";
        if (node.match(/^<?\w[^>]*[^\/]$/)) indentLevel++;
    });
    formattedText = formattedText.substring(1, formattedText.length - 2);
    out.innerHTML = syntaxHighlightXML(formattedText);
    addCollapsibleListeners();
}

function syntaxHighlightJSON(json) {
    let openBrackets = 0;
    const unmatchedBrackets = [];
    json = json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    json = json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
            let cls = "number";
            if (/^"/.test(match)) cls = /:$/.test(match) ? "key" : "string";
            else if (/true|false/.test(match)) cls = "boolean";
            else if (/null/.test(match)) cls = "null";
            return `<span class="${cls}">${match}</span>`;
        }
    );

    json = json.replace(/(\{|\[|\}|\])/g, (match) => {
        if (match === "{" || match === "[") {
            openBrackets++;
            unmatchedBrackets.push(match);
            return `<span class="collapsible active">${match}</span><div class="content">`;
        } else if ((match === "}" || match === "]") && openBrackets > 0) {
            openBrackets--;
            unmatchedBrackets.pop();
            return `</div><span>${match}</span>`;
        } else {
            return match;
        }
    });

    for (let i = 0; i < unmatchedBrackets.length; i++) {
        const unmatched = unmatchedBrackets[i];
        json = json.replace(`<span class="collapsible active">${unmatched}</span><div class="content">`, unmatched);
    }

    return "<code>" + json + "</code>";
}

function syntaxHighlightXML(xml) {
    let openTags = 0;
    const unmatchedTags = [];
    xml = xml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    xml = xml.replace(
        /(&lt;\/?[^&]+?&gt;|&quot;[^&]+?&quot;|&lt;[^&]+&gt;)/g,
        (match) => {
            let cls = "xml-tag";
            if (/^&lt;\/[^&]+&gt;$/.test(match)) cls = "xml-tag";
            else if (/^&lt;[^&]+&gt;$/.test(match)) cls = "xml-tag";
            else if (/&quot;[^&]+&quot;/.test(match)) cls = "xml-value";
            return `<span class="${cls}">${match}</span>`;
        }
    );

    xml = xml.replace(/(&lt;[^\/&][^&]*&gt;)/g, (match) => {
        openTags++;
        unmatchedTags.push(match);
        return `<span class="collapsible active">${match}</span><div class="content">`;
    });
    xml = xml.replace(/(&lt;\/[^&]+&gt;)/g, (match) => {
        if (openTags > 0) {
            openTags--;
            unmatchedTags.pop();
            return `</div><span>${match}</span>`;
        } else {
            return match;
        }
    });

    for (let i = 0; i < unmatchedTags.length; i++) {
        const unmatched = unmatchedTags[i];
        xml = xml.replace(`<span class="collapsible active">${unmatched}</span><div class="content">`, unmatched);
    }

    return "<code>" + xml + "</code>";
}

function addCollapsibleListeners() {
    const coll = [...document.getElementsByClassName("collapsible")];
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            this.nextElementSibling.classList.toggle("active-sib");
        });
    }
}

function clearText() {
    ta.value = "";
    out.innerHTML = "";
    menu1.style.display = "none";
    menu2.style.display = "none";
    menu3.style.display = "none";
}

function collapseAll() {
    const coll = [...document.getElementsByClassName("active")];
    for (let i = 0; i < coll.length; i++) {
        let c = coll[i];
        c.classList.remove("active");
        c.nextElementSibling.classList.add("active-sib");
    }
}

function expandAll() {
    const coll = [...document.getElementsByClassName("collapsible")];
    for (let i = 0; i < coll.length; i++) {
        let c = coll[i];
        c.classList.add("active");
        c.nextElementSibling.classList.remove("active-sib");
    }
}

let timeout;
window.onscroll = function() {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(scrollFunction, 350);
};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function copyToClipboard() {
    navigator.clipboard.writeText(finalOutput);
    al.style.display = "block";
    setTimeout(() => {
        al.style.display = "none";
    }, 1000);
}
