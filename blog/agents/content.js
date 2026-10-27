/* Texts of the post "How we build our agents", in English and Spanish.
   Everything the reader sees lives here; app.js only draws it.
   Numbers in `shared` were measured on our own machines (19–27 October 2026). */
window.AX_AGENTS_CONTENT = {
  shared: {
    contextLimit: 8192,
    instructionsTokens: 100,
    plugs: [
      { id: "bio", name: "bio-compacto", tools: 7, tokens: 900, ours: true },
      { id: "gget", name: "gget-mcp", tools: 20, tokens: 3200, ours: false },
      { id: "biomcp", name: "BioMCP", tools: 7, tokens: 2300, ours: false }
    ],
    model: { params: "744 B", disk: 419, ram: 32, diskTotal: 1000 },
    trace: {
      tokensIn1: 1233, tokensOut1: 26, tokensIn2: 1470, tokensOut2: 233,
      localSec: [0, 1130, 1, 968, 0], cloudSec: [0, 4, 1, 6, 0],
      localTotal: "35 min", cloudTotal: "< 20 s"
    }
  },

  en: {
    langName: "English",
    hero: {
      kicker: "Founder's notes · how we work",
      title: "How we build our agents",
      titleEm: "on open weights and open tools",
      standfirst: "An agent, a harness, an MCP and an old PC with no GPU. The whole recipe, explained the way we wish someone had explained it to us.",
      meta: "Alejandro Atienza · AjaxDNA · 27 October 2026 · 10 min read",
      badges: ["No licences to run it", "Runs on 32 GB of RAM", "Open source next"],
      back: "← Back to the blog"
    },
    origin: {
      kicker: "Where this comes from",
      title: "Born copy-pasting",
      paras: [
        "By chance or by disgrace, AjaxDNA was born in Spain, in the era of AI. It was born when ChatGPT 3 came out, copy-pasting results from the chat into Notepad to build longer and longer chunks of code.",
        "As the years passed, Ajax became a company: not just a project, but a place where people learn and create meaningful work for society. AI is still one of our main tools, but writing code in Notepad stopped making sense a long time ago. Now we have our first <b>agents</b>: specialised machines working tirelessly on problems that no human team can keep alive around the clock.",
        "This post shares the way we currently make our agents, so anyone can use it, help us find the weak spots and build a better biology together. One assumption: you, like us, do not want to pay extra for an API key. So everything below runs <b>without a single software licence</b>: open-weights model, open-source engine, open-source editor. (We pay for an assistant to install it and, when we want speed, for a cloud model; both are optional.) We intend to release the agents themselves as open source. Until then, take this as a demystifying note for anyone curious about the intersection of AI and biotechnology, and as a way to order my own thoughts after a conversation with our CTO."
      ],
      timeline: [
        { when: "Then", what: "ChatGPT 3 + Notepad", how: "Copy, paste, repeat." },
        { when: "Later", what: "A company", how: "People, projects, a lab." },
        { when: "Now", what: "Our first agents", how: "Machines that work while we sleep." }
      ]
    },
    agent: {
      kicker: "1 · The idea",
      title: "An agent is a program that lets a model reread itself",
      paras: [
        "For me, an agent is a program: some lines of code that give an LLM at least one capability, <b>the capability to reread something it has written and create a new response</b> based on its previous response and on the objective you gave it at the start.",
        "That is the whole trick. One loop. From there you can go anywhere you want.",
        "Watch it happen below with a real question we asked our biology agent. Press play and count the turns. The clock is real: switch between our local model and a cloud model to see what the loop costs in time."
      ],
      play: "Play", replay: "Play again", pause: "Pause",
      modeLocal: "Local GLM-5.3", modeCloud: "Cloud model",
      clock: "Elapsed", turn: "Turn", turns: "turns", tool: "tool",
      nodes: ["Context", "LLM", "Tool", "Result"],
      nodeHint: "The loop: the harness assembles the context, the model writes, the harness runs what it asked for and pastes the result back into the context.",
      steps: [
        { who: "you", title: "You ask",
          body: "Which gene encodes the human p53 protein? Use a tool and cite the source." },
        { who: "llm", title: "Turn 1 · the model writes a request",
          body: "It reads everything it has been given (its instructions, the description of 7 tools and your question: 1,233 tokens) and writes 26 tokens. Not an answer, a request: <code>buscar_gen(simbolo: \"TP53\", especie: \"human\")</code>.",
          timeLocal: "18 min 50 s", timeCloud: "a few seconds" },
        { who: "tool", title: "The harness runs the tool",
          body: "<code>buscar_gen</code> asks NCBI and pastes the reply under the conversation (shortened): “TP53 · tumor protein p53 · Entrez 7157 · Ensembl ENSG00000141510 · UniProt P04637 · 17p13.1 · a tumour suppressor that…”",
          timeLocal: "≈ 1 s", timeCloud: "≈ 1 s" },
        { who: "llm", title: "Turn 2 · the model rereads itself and answers",
          body: "Now it reads 1,470 tokens, including its own request and the result, and writes 233: “The human p53 protein is encoded by the <b>TP53</b> gene, on chromosome 17 (17p13.1). UniProt P04637. Source: NCBI Gene 7157.”",
          timeLocal: "16 min 08 s", timeCloud: "a few seconds" },
        { who: "done", title: "Done",
          body: "Two turns, one tool. Turn 2 is the capability we were talking about: the model reread what it wrote in turn 1 and did something new with it." }
      ],
      totals: { local: "35 min measured", cloud: "5 to 20 s measured" }
    },
    harness: {
      kicker: "2 · The code around the model",
      title: "The harness: what keeps the model on the ground",
      paras: [
        "To set up an agent you need an LLM, and then you need the code around it so the answer gets sent back to the model. That extra code is called a <b>harness</b>, and basically it prevents the LLM from flying off to the clouds.",
        "A harness is a bunch of lines of code that do three things:"
      ],
      three: [
        "<b>Give context to the LLM.</b> “You are a Nobel-winning biologist working on…”",
        "<b>Set the tools it has available.</b> An NCBI access portal, any Python script you keep around for editing the central dogma of biology.",
        "<b>Set the protocols.</b> Context on how to combine those tools for certain operations."
      ],
      after: "Click each part of the ring to see what ours really contains. Nothing here is hypothetical: it is the agent from the loop above.",
      parts: {
        llm: { name: "LLM", title: "The model, in the middle",
          body: "The model only does one thing: it reads a list of messages and writes the next one. No memory between calls, no hands. Everything else in this picture is the harness." },
        context: { name: "Context", title: "1 · Context",
          body: "Everything the model reads before writing: who it is, the rules, the conversation so far and the results that came back. Ours is five sentences long on purpose. The model has 8,192 tokens of desk space, and every sentence here is paid for in every turn.",
          exampleTitle: "Our instructions, translated (the original is in Spanish)",
          example: ["You are a biology research assistant. Answer in Spanish.",
            "Do not state anything you have not checked with a tool, and cite the source (URL or PMID) of every fact.",
            "Use the smallest tool that will do; read big files in chunks with leer_fichero.",
            "If a tool fails, say so and try another way.",
            "End with a short answer."] },
        tools: { name: "Tools", title: "2 · Tools",
          body: "What the model can ask for. Each tool is a function on our side plus a one-line description the model reads. It never runs anything itself: it writes “I want buscar_gen with TP53” and the harness does the rest.",
          exampleTitle: "The seven tools of bio-compacto, our own MCP",
          example: ["buscar_gen · a gene card from NCBI (IDs, position, summary)",
            "proteina · a protein card from UniProt (function, location)",
            "pubmed · search PubMed, up to 10 articles",
            "resumen_articulo · the abstract of one article",
            "secuencia · download a FASTA sequence to a file",
            "blast · remote BLAST at NCBI, with a ticket if it is slow",
            "leer_fichero · read a saved file, a few lines at a time"] },
        protocols: { name: "Protocols", title: "3 · Protocols",
          body: "How to combine the tools for a job: in which order, what to do if one fails, how to read a long result. In our agent they live in two places: the instructions, and the descriptions the tools themselves carry.",
          exampleTitle: "Three protocols our agent follows",
          example: ["A gene question: buscar_gen, then proteina, then pubmed. Cite PMIDs.",
            "BLAST: if NCBI takes more than four minutes you get a ticket (rid). Call again with only the ticket; never repeat the search.",
            "Anything long is saved to a file. Read it in chunks with leer_fichero instead of asking for all of it."] }
      }
    },
    mcp: {
      kicker: "3 · Tools that come with their manual",
      title: "MCP: a protocol that brings its own tools",
      paras: [
        "When a protocol is about how to interact with a certain number of tools that are related, or that for whatever reason someone decided should go together, then that protocol is an <b>MCP</b>.",
        "In practice an MCP is a small server. It announces its tools and how to use them in a standard format (<i>Model Context Protocol</i>), so any harness can plug it in without custom code. We wrote one for biology, <b>bio-compacto</b>, with seven tools. Two others we simply downloaded.",
        "There is a catch, and it is the thing nobody tells you: <b>every tool you plug in is paid for in context</b>. The model reads the description of every available tool in every turn. Flip the switches and watch the desk fill up."
      ],
      plugLabels: { ours: "ours", theirs: "downloaded", tools: "tools", tokens: "tokens per turn", on: "plugged in", off: "unplugged" },
      plugDesc: {
        bio: "NCBI Gene, UniProt, PubMed, FASTA, BLAST",
        gget: "Ensembl, sequences, enrichment, AlphaFold structures",
        biomcp: "articles, clinical trials, variants"
      },
      budget: {
        title: "The desk: 8,192 tokens per turn",
        instructions: "Instructions",
        free: "Room left for the conversation and the results",
        used: "used before the first question",
        left: "left",
        of: "of"
      },
      caption: "With all three plugged in, about 6,500 of the 8,192 tokens are gone before you ask anything. Our rule: plug in only what the question needs, and switch off the tools you will not use inside each MCP."
    },
    assembly: {
      kicker: "4 · The assembly",
      title: "An old PC, Colibri, GLM-5.3 and LangFlow",
      paras: [
        "Now the assembly. You take your old PC, <b>32 GB of RAM, no GPU and 1 TB of disk</b>, and install <b>Colibri</b>, an open-source inference engine written in C.",
        "Then you download <b>GLM-5.3</b>, a 744-billion-parameter model that takes 419 GB on disk. Most people can do both by asking Claude Code to “set everything up please”, with the GitHub link to Colibri and the sentence “install GLM-5.3 to run Colibri”. A couple of hours later, and a break for your Claude subscription to recover its tokens, the model is ready.",
        "How does a 419 GB model run in 32 GB of memory? That is Colibri's trick. GLM-5.3 is a <i>mixture of experts</i>: for every word, only a few of its “experts” are needed. Colibri keeps the dense part of the model in RAM and reads the experts each word needs from the disk, every single word. That is why it works, and why it is slow.",
        "Now everything you need is a way to code the harness. You can do that with <b>LangFlow</b>, for example: a visual editor where the harness is a handful of blocks. We put LangFlow, the MCP servers and a small monitor on a second machine, so the old PC does one thing only: answer the API."
      ],
      scene: {
        brainTitle: "The old PC · the brain",
        disk: "1 TB disk",
        model: "GLM-5.3 · 419 GB",
        ram: "RAM · 32 GB",
        ramNote: "same scale: 13× smaller than the model",
        cpu: "CPU",
        gpu: "GPU · not used",
        colibri: "Colibri",
        flowExperts: "every word: reads from the disk the experts that word needs (≈ 19 GB)",
        flowDense: "the dense part stays in RAM",
        api: "API · once per turn: the whole context goes in (≤ 8,192 tokens), the answer comes out",
        workTitle: "The workplace · a second machine",
        langflow: "LangFlow · the harness",
        mcps: "MCP servers · the tools",
        monitor: "Monitor · every call, every token",
        flowTools: "tool calls never leave this machine",
        browser: "Your browser",
        flowBrowser: "you ask and watch from here",
        steps: [
          "Ask Claude Code: “set everything up please” + the link to Colibri",
          "Download GLM-5.3 (419 GB) and start Colibri",
          "Build the harness in LangFlow and plug in the MCPs"
        ]
      }
    },
    cost: {
      kicker: "5 · Measured, not guessed",
      title: "What it actually costs",
      intro: "Numbers from our own machines, 19 to 27 October 2026. This is the honest part of the post.",
      tiles: [
        { value: "744 B", label: "parameters in GLM-5.3" },
        { value: "419 GB", label: "on disk, 4-bit weights" },
        { value: "32 GB", label: "of RAM in the old PC" },
        { value: "0.3", label: "words per second, CPU only" },
        { value: "19 GB", label: "read from disk per word" },
        { value: "35 min", label: "one question, one tool · cloud model: under 20 s" },
        { value: "0 €", label: "in licences to run it" }
      ],
      weakTitle: "The weak spots, so you can help us with them",
      weak: [
        "<b>RAM is the bottleneck, not the GPU.</b> The model is 13 times bigger than the memory, so every word is a trip to the disk. More RAM would help more than any graphics card.",
        "<b>8,192 tokens of context.</b> Enough for a lean harness; not enough for the big agent frameworks. Biomni's instructions alone are 39,000 tokens.",
        "<b>The first turn is the slow one.</b> Reading 1,200 tokens of context took 16 minutes. Everything you add to the context is paid for in minutes.",
        "<b>One request at a time.</b> Several agents in parallel would simply queue.",
        "<b>No verifier yet.</b> The agent cites its sources; nobody checks them automatically. That is the next piece.",
        "<b>When speed matters we use a cloud model</b> through the same harness. That costs money. The method does not require it."
      ]
    },
    recipe: {
      kicker: "6 · Do it yourself",
      title: "The recipe, in four lines",
      steps: [
        { t: "Ask", d: "Open Claude Code on the old PC and type: “Set everything up please” + the link github.com/JustVugg/colibri + “install GLM-5.3 to run Colibri”." },
        { t: "Wait", d: "419 GB take a few hours. Let your subscription recover its tokens." },
        { t: "Build", d: "Install LangFlow and draw the loop: an Agent block (the context), an MCP Tools block (the tools and their protocols), a chat in and a chat out." },
        { t: "Count", d: "Ask a question. Open the trace. Count the turns. You have an agent." }
      ]
    },
    glossary: {
      title: "Glossary",
      intro: "The words of this post, in the order they appeared. We use the same ones everywhere: in our tutorials, in our monitor and in the code.",
      terms: [
        ["Agent", "A program that gives a model the capability to reread what it wrote and write again, towards an objective."],
        ["LLM", "Large language model. The part that writes. Reads a list of messages, writes the next one, remembers nothing between calls."],
        ["Harness", "The code around the model: it gives it context, tools and protocols, and sends its answer back to it. The straps that keep it on the ground."],
        ["Context", "Everything the model reads before writing: instructions, tool descriptions, the conversation, the results."],
        ["Token", "The unit the model reads and writes in. Roughly three quarters of a word."],
        ["Context window", "How many tokens fit in one turn. Ours: 8,192."],
        ["Tool", "A function on our side plus a one-line description the model reads. The model asks; the harness runs it."],
        ["Protocol", "Instructions on how to combine tools for a job: order, fallbacks, how to read long results."],
        ["MCP", "A protocol that comes with its tools, packaged in a standard format (Model Context Protocol) so any harness can plug it in. A small server."],
        ["Mixture of experts", "A model built from many “experts” of which only a few wake up for each word. That is what lets a 419 GB model run from a disk."],
        ["Inference", "Running the model to produce text. Not training it."],
        ["Colibri", "An open-source inference engine in C that keeps the dense part of a model in RAM and reads its experts from disk."],
        ["GLM-5.3", "The open-weights model we run locally. 744 billion parameters, 419 GB on disk at 4 bits."],
        ["LangFlow", "A visual editor where the harness is drawn with blocks instead of written in code."],
        ["API", "The door through which a program sends messages to the model and gets text back. One HTTP call per turn."],
        ["Monitor", "Our small page that shows every call to the model: tokens in, tokens out, time, what it thought."]
      ]
    },
    outro: {
      title: "Help us find the weak spots",
      body: "If you build agents for biology, or want to, tell us where this breaks. The agents themselves will follow, as open source.",
      cta: "Write to us →",
      linkedin: "Follow the work on LinkedIn"
    },
    noscript: "This article uses JavaScript for its interactive figures. Please enable it to read the post."
  },

  es: {
    langName: "Español",
    hero: {
      kicker: "Notas del fundador · cómo trabajamos",
      title: "Cómo construimos nuestros agentes",
      titleEm: "con modelos y herramientas abiertos",
      standfirst: "Un agente, un harness, un MCP y un PC viejo sin GPU. La receta entera, explicada como nos habría gustado que nos la explicaran.",
      meta: "Alejandro Atienza · AjaxDNA · 27 de octubre de 2026 · 10 min de lectura",
      badges: ["Sin licencias para hacerlo funcionar", "Corre con 32 GB de RAM", "Siguiente paso: código abierto"],
      back: "← Volver al blog"
    },
    origin: {
      kicker: "De dónde viene esto",
      title: "Nacidos copiando y pegando",
      paras: [
        "Por azar o por desgracia, AjaxDNA nació en España, en la era de la IA. Nació cuando salió ChatGPT 3, copiando los resultados del chat en el Bloc de notas para construir trozos de código cada vez más largos.",
        "Con los años, Ajax se convirtió en una empresa: no solo un proyecto, sino un sitio donde la gente aprende y crea trabajo con sentido para la sociedad. La IA sigue siendo una de nuestras herramientas principales, pero escribir código en el Bloc de notas dejó de tener sentido hace mucho. Ahora tenemos nuestros primeros <b>agentes</b>: máquinas especializadas que trabajan sin descanso en problemas que ningún equipo humano puede mantener vivos las 24 horas.",
        "Esta entrada cuenta cómo hacemos hoy nuestros agentes, para que cualquiera pueda usarlo, ayudarnos a encontrar los puntos débiles y construir juntos una biología mejor. Una suposición: tú, como nosotros, no quieres pagar de más por una clave de API. Así que todo lo que sigue funciona <b>sin una sola licencia de software</b>: modelo de pesos abiertos, motor de código abierto, editor de código abierto. (Pagamos un asistente para instalarlo y, cuando queremos velocidad, un modelo en la nube; las dos cosas son opcionales.) Tenemos la intención de publicar los propios agentes como código abierto. Hasta entonces, tómate esto como una nota para desmitificar, pensada para cualquiera con curiosidad por el cruce entre IA y biotecnología, y como una forma de ordenar mis ideas después de una conversación con nuestro CTO."
      ],
      timeline: [
        { when: "Antes", what: "ChatGPT 3 + Bloc de notas", how: "Copiar, pegar, repetir." },
        { when: "Después", what: "Una empresa", how: "Gente, proyectos, un laboratorio." },
        { when: "Ahora", what: "Los primeros agentes", how: "Máquinas que trabajan mientras dormimos." }
      ]
    },
    agent: {
      kicker: "1 · La idea",
      title: "Un agente es un programa que deja al modelo releerse",
      paras: [
        "Para mí, un agente es un programa: unas líneas de código que dan a un LLM al menos una capacidad, <b>la de releer algo que ha escrito y crear una respuesta nueva</b> a partir de su respuesta anterior y del objetivo que le diste al principio.",
        "Ese es todo el truco. Un bucle. A partir de ahí puedes ir a donde quieras.",
        "Míralo abajo con una pregunta real que le hicimos a nuestro agente de biología. Dale a reproducir y cuenta las vueltas. El reloj es real: cambia entre nuestro modelo local y un modelo en la nube para ver lo que cuesta el bucle en tiempo."
      ],
      play: "Reproducir", replay: "Otra vez", pause: "Pausa",
      modeLocal: "GLM-5.3 local", modeCloud: "Modelo en la nube",
      clock: "Transcurrido", turn: "Vuelta", turns: "vueltas", tool: "herramienta",
      nodes: ["Contexto", "LLM", "Herramienta", "Resultado"],
      nodeHint: "El bucle: el harness monta el contexto, el modelo escribe, el harness ejecuta lo que pidió y pega el resultado de vuelta en el contexto.",
      steps: [
        { who: "you", title: "Tú preguntas",
          body: "¿Qué gen codifica la proteína p53 humana? Usa una herramienta y cita la fuente." },
        { who: "llm", title: "Vuelta 1 · el modelo escribe una petición",
          body: "Lee todo lo que le han dado (sus instrucciones, la descripción de 7 herramientas y tu pregunta: 1 233 tokens) y escribe 26 tokens. No una respuesta: una petición: <code>buscar_gen(simbolo: \"TP53\", especie: \"human\")</code>.",
          timeLocal: "18 min 50 s", timeCloud: "unos segundos" },
        { who: "tool", title: "El harness ejecuta la herramienta",
          body: "<code>buscar_gen</code> pregunta a NCBI y pega la respuesta debajo de la conversación (recortada): «TP53 · tumor protein p53 · Entrez 7157 · Ensembl ENSG00000141510 · UniProt P04637 · 17p13.1 · un supresor de tumores que…»",
          timeLocal: "≈ 1 s", timeCloud: "≈ 1 s" },
        { who: "llm", title: "Vuelta 2 · el modelo se relee y responde",
          body: "Ahora lee 1 470 tokens, incluidos su propia petición y el resultado, y escribe 233: «La proteína p53 humana la codifica el gen <b>TP53</b>, en el cromosoma 17 (17p13.1). UniProt P04637. Fuente: NCBI Gene 7157.»",
          timeLocal: "16 min 08 s", timeCloud: "unos segundos" },
        { who: "done", title: "Hecho",
          body: "Dos vueltas, una herramienta. La vuelta 2 es la capacidad de la que hablábamos: el modelo releyó lo que escribió en la vuelta 1 e hizo algo nuevo con ello." }
      ],
      totals: { local: "35 min medidos", cloud: "entre 5 y 20 s medidos" }
    },
    harness: {
      kicker: "2 · El código alrededor del modelo",
      title: "El harness: lo que mantiene al modelo en el suelo",
      paras: [
        "Para montar un agente necesitas un LLM, y después necesitas el código de alrededor para que la respuesta se le vuelva a mandar al modelo. Ese código extra se llama <b>harness</b> (arnés), y básicamente evita que el LLM se vaya volando a las nubes.",
        "Un harness son unas cuantas líneas de código que hacen tres cosas:"
      ],
      three: [
        "<b>Dar contexto al LLM.</b> «Eres un biólogo ganador del Nobel que trabaja en…»",
        "<b>Fijar las herramientas que tiene disponibles.</b> Un portal de acceso a NCBI, cualquier script de Python que tengas por ahí para modificar el dogma central de la biología.",
        "<b>Fijar los protocolos.</b> Contexto sobre cómo combinar esas herramientas para ciertas operaciones."
      ],
      after: "Pincha cada parte del anillo para ver qué contiene de verdad el nuestro. Nada de esto es hipotético: es el agente del bucle de arriba.",
      parts: {
        llm: { name: "LLM", title: "El modelo, en el centro",
          body: "El modelo solo hace una cosa: lee una lista de mensajes y escribe el siguiente. Sin memoria entre llamadas, sin manos. Todo lo demás de este dibujo es el harness." },
        context: { name: "Contexto", title: "1 · Contexto",
          body: "Todo lo que el modelo lee antes de escribir: quién es, las reglas, la conversación hasta ahora y los resultados que han vuelto. El nuestro tiene cinco frases a propósito. El modelo tiene 8 192 tokens de mesa, y cada frase de aquí se paga en cada vuelta.",
          exampleTitle: "Nuestras instrucciones, tal cual",
          example: ["Eres un asistente de investigación en biología. Responde en español.",
            "No afirmes nada que no hayas comprobado con una herramienta y cita la fuente (URL o PMID) de cada dato.",
            "Usa la herramienta más pequeña que baste; los ficheros grandes léelos por trozos con leer_fichero.",
            "Si una herramienta falla, dilo y prueba otra vía.",
            "Termina con una respuesta breve."] },
        tools: { name: "Herramientas", title: "2 · Herramientas",
          body: "Lo que el modelo puede pedir. Cada herramienta es una función de nuestro lado más una línea de descripción que el modelo lee. Él nunca ejecuta nada: escribe «quiero buscar_gen con TP53» y el harness hace el resto.",
          exampleTitle: "Las siete herramientas de bio-compacto, nuestro propio MCP",
          example: ["buscar_gen · ficha de un gen en NCBI (IDs, posición, resumen)",
            "proteina · ficha de una proteína en UniProt (función, localización)",
            "pubmed · busca en PubMed, hasta 10 artículos",
            "resumen_articulo · el resumen de un artículo",
            "secuencia · descarga una secuencia FASTA a un fichero",
            "blast · BLAST remoto en NCBI, con resguardo si tarda",
            "leer_fichero · lee un fichero guardado, unas líneas cada vez"] },
        protocols: { name: "Protocolos", title: "3 · Protocolos",
          body: "Cómo combinar las herramientas para un trabajo: en qué orden, qué hacer si una falla, cómo leer un resultado largo. En nuestro agente viven en dos sitios: las instrucciones y las descripciones que traen las propias herramientas.",
          exampleTitle: "Tres protocolos que sigue nuestro agente",
          example: ["Pregunta sobre un gen: buscar_gen, luego proteina, luego pubmed. Cita los PMID.",
            "BLAST: si NCBI tarda más de cuatro minutos recibes un resguardo (rid). Vuelve a llamar solo con el resguardo; nunca repitas la búsqueda.",
            "Lo largo se guarda en un fichero. Léelo por trozos con leer_fichero en vez de pedirlo entero."] }
      }
    },
    mcp: {
      kicker: "3 · Herramientas que traen su manual",
      title: "MCP: un protocolo que trae sus propias herramientas",
      paras: [
        "Cuando un protocolo trata de cómo interactuar con un cierto número de herramientas que están relacionadas, o que por la razón que sea alguien decidió que deben ir juntas, entonces ese protocolo es un <b>MCP</b>.",
        "En la práctica, un MCP es un servidor pequeño. Anuncia sus herramientas y cómo usarlas en un formato estándar (<i>Model Context Protocol</i>), para que cualquier harness lo enchufe sin código a medida. Nosotros escribimos uno para biología, <b>bio-compacto</b>, con siete herramientas. Otros dos simplemente los descargamos.",
        "Hay una pega, y es lo que nadie te cuenta: <b>cada herramienta que enchufas se paga en contexto</b>. El modelo lee la descripción de todas las herramientas disponibles en cada vuelta. Mueve los interruptores y mira cómo se llena la mesa."
      ],
      plugLabels: { ours: "nuestro", theirs: "descargado", tools: "herramientas", tokens: "tokens por vuelta", on: "enchufado", off: "desenchufado" },
      plugDesc: {
        bio: "NCBI Gene, UniProt, PubMed, FASTA, BLAST",
        gget: "Ensembl, secuencias, enriquecimiento, estructuras de AlphaFold",
        biomcp: "artículos, ensayos clínicos, variantes"
      },
      budget: {
        title: "La mesa: 8 192 tokens por vuelta",
        instructions: "Instrucciones",
        free: "Sitio que queda para la conversación y los resultados",
        used: "gastados antes de la primera pregunta",
        left: "libres",
        of: "de"
      },
      caption: "Con los tres enchufados, unos 6 500 de los 8 192 tokens se han ido antes de preguntar nada. Nuestra regla: enchufar solo lo que la pregunta necesita, y apagar dentro de cada MCP las herramientas que no vas a usar."
    },
    assembly: {
      kicker: "4 · El montaje",
      title: "Un PC viejo, Colibri, GLM-5.3 y LangFlow",
      paras: [
        "Ahora el montaje. Coges tu PC viejo, <b>32 GB de RAM, sin GPU y 1 TB de disco</b>, e instalas <b>Colibri</b>, un motor de inferencia de código abierto escrito en C.",
        "Después descargas <b>GLM-5.3</b>, un modelo de 744 000 millones de parámetros que ocupa 419 GB en disco. La mayoría puede hacer las dos cosas pidiéndole a Claude Code «móntamelo todo, por favor», con el enlace de GitHub de Colibri y la frase «instala GLM-5.3 para correr Colibri». Un par de horas después, y una pausa para que tu suscripción a Claude recupere sus tokens, el modelo está listo.",
        "¿Cómo corre un modelo de 419 GB en 32 GB de memoria? Ese es el truco de Colibri. GLM-5.3 es una <i>mezcla de expertos</i>: para cada palabra solo hacen falta unos pocos de sus «expertos». Colibri mantiene la parte densa del modelo en la RAM y lee del disco los expertos que necesita cada palabra, palabra a palabra. Por eso funciona, y por eso es lento.",
        "Ahora solo te falta una forma de programar el harness. Puedes hacerlo con <b>LangFlow</b>, por ejemplo: un editor visual donde el harness son un puñado de bloques. Nosotros pusimos LangFlow, los servidores MCP y un monitor pequeño en una segunda máquina, para que el PC viejo haga una sola cosa: contestar a la API."
      ],
      scene: {
        brainTitle: "El PC viejo · el cerebro",
        disk: "Disco · 1 TB",
        model: "GLM-5.3 · 419 GB",
        ram: "RAM · 32 GB",
        ramNote: "misma escala: 13 veces más pequeña que el modelo",
        cpu: "CPU",
        gpu: "GPU · sin usar",
        colibri: "Colibri",
        flowExperts: "en cada palabra: lee del disco los expertos que esa palabra necesita (≈ 19 GB)",
        flowDense: "la parte densa se queda en la RAM",
        api: "API · una vez por vuelta: entra todo el contexto (≤ 8 192 tokens), sale la respuesta",
        workTitle: "El lugar de trabajo · una segunda máquina",
        langflow: "LangFlow · el harness",
        mcps: "Servidores MCP · las herramientas",
        monitor: "Monitor · cada llamada, cada token",
        flowTools: "las llamadas a herramientas no salen de esta máquina",
        browser: "Tu navegador",
        flowBrowser: "desde aquí preguntas y miras",
        steps: [
          "Pídele a Claude Code: «móntamelo todo, por favor» + el enlace de Colibri",
          "Descarga GLM-5.3 (419 GB) y arranca Colibri",
          "Monta el harness en LangFlow y enchufa los MCP"
        ]
      }
    },
    cost: {
      kicker: "5 · Medido, no supuesto",
      title: "Lo que cuesta de verdad",
      intro: "Cifras de nuestras propias máquinas, del 19 al 27 de octubre de 2026. Esta es la parte honesta de la entrada.",
      tiles: [
        { value: "744 B", label: "parámetros en GLM-5.3 (B = miles de millones)" },
        { value: "419 GB", label: "en disco, pesos a 4 bits" },
        { value: "32 GB", label: "de RAM en el PC viejo" },
        { value: "0,3", label: "palabras por segundo, solo CPU" },
        { value: "19 GB", label: "leídos del disco por cada palabra" },
        { value: "35 min", label: "una pregunta, una herramienta · modelo en la nube: menos de 20 s" },
        { value: "0 €", label: "en licencias para hacerlo funcionar" }
      ],
      weakTitle: "Los puntos débiles, para que nos ayudes con ellos",
      weak: [
        "<b>El cuello de botella es la RAM, no la GPU.</b> El modelo es 13 veces más grande que la memoria, así que cada palabra es un viaje al disco. Más RAM ayudaría más que cualquier tarjeta gráfica.",
        "<b>8 192 tokens de contexto.</b> Bastan para un harness ligero; no para los grandes marcos de agentes. Solo las instrucciones de Biomni ocupan 39 000 tokens.",
        "<b>La primera vuelta es la lenta.</b> Leer 1 200 tokens de contexto costó 16 minutos. Todo lo que añades al contexto se paga en minutos.",
        "<b>Una petición cada vez.</b> Varios agentes en paralelo simplemente harían cola.",
        "<b>Todavía no hay verificador.</b> El agente cita sus fuentes; nadie las comprueba automáticamente. Esa es la siguiente pieza.",
        "<b>Cuando importa la velocidad usamos un modelo en la nube</b> con el mismo harness. Eso cuesta dinero. El método no lo exige."
      ]
    },
    recipe: {
      kicker: "6 · Hazlo tú",
      title: "La receta, en cuatro líneas",
      steps: [
        { t: "Pide", d: "Abre Claude Code en el PC viejo y escribe: «Móntamelo todo, por favor» + el enlace github.com/JustVugg/colibri + «instala GLM-5.3 para correr Colibri»." },
        { t: "Espera", d: "419 GB tardan unas horas. Deja que tu suscripción recupere sus tokens." },
        { t: "Monta", d: "Instala LangFlow y dibuja el bucle: un bloque Agent (el contexto), un bloque MCP Tools (las herramientas y sus protocolos), una entrada de chat y una salida." },
        { t: "Cuenta", d: "Haz una pregunta. Abre la traza. Cuenta las vueltas. Ya tienes un agente." }
      ]
    },
    glossary: {
      title: "Glosario",
      intro: "Las palabras de esta entrada, en el orden en que aparecieron. Usamos las mismas en todas partes: en los tutoriales, en el monitor y en el código.",
      terms: [
        ["Agente", "Un programa que da a un modelo la capacidad de releer lo que escribió y volver a escribir, hacia un objetivo."],
        ["LLM", "Modelo grande de lenguaje. La parte que escribe. Lee una lista de mensajes, escribe el siguiente, no recuerda nada entre llamadas."],
        ["Harness", "El código alrededor del modelo: le da contexto, herramientas y protocolos, y le devuelve su propia respuesta. El arnés que lo mantiene en el suelo."],
        ["Contexto", "Todo lo que el modelo lee antes de escribir: instrucciones, descripciones de herramientas, la conversación, los resultados."],
        ["Token", "La unidad en la que el modelo lee y escribe. Unos tres cuartos de palabra."],
        ["Ventana de contexto", "Cuántos tokens caben en una vuelta. La nuestra: 8 192."],
        ["Herramienta", "Una función de nuestro lado más una línea de descripción que el modelo lee. El modelo pide; el harness la ejecuta."],
        ["Protocolo", "Instrucciones sobre cómo combinar herramientas para un trabajo: orden, alternativas si algo falla, cómo leer resultados largos."],
        ["MCP", "Un protocolo que trae sus herramientas, empaquetado en un formato estándar (Model Context Protocol) para que cualquier harness lo enchufe. Un servidor pequeño."],
        ["Mezcla de expertos", "Un modelo hecho de muchos «expertos» de los que solo unos pocos despiertan para cada palabra. Es lo que permite correr un modelo de 419 GB desde un disco."],
        ["Inferencia", "Hacer funcionar el modelo para producir texto. No entrenarlo."],
        ["Colibri", "Un motor de inferencia de código abierto en C que mantiene la parte densa de un modelo en RAM y lee sus expertos del disco."],
        ["GLM-5.3", "El modelo de pesos abiertos que corremos en local. 744 000 millones de parámetros, 419 GB en disco a 4 bits."],
        ["LangFlow", "Un editor visual donde el harness se dibuja con bloques en vez de escribirse en código."],
        ["API", "La puerta por la que un programa manda mensajes al modelo y recibe texto. Una llamada HTTP por vuelta."],
        ["Monitor", "Nuestra pequeña página que enseña cada llamada al modelo: tokens que entran, tokens que salen, tiempo, lo que pensó."]
      ]
    },
    outro: {
      title: "Ayúdanos a encontrar los puntos débiles",
      body: "Si construyes agentes para biología, o quieres hacerlo, dinos dónde se rompe esto. Los propios agentes irán detrás, en código abierto.",
      cta: "Escríbenos →",
      linkedin: "Sigue el trabajo en LinkedIn"
    },
    noscript: "Este artículo usa JavaScript para sus figuras interactivas. Actívalo para leer la entrada."
  }
};
