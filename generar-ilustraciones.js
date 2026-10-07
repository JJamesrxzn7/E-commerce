(() => {
  const fs = require("node:fs");
  const path = require("node:path");
  const catalogPath = path.join(__dirname, "data", "products.json");
  const imagesDirectory = path.join(__dirname, "images", "products");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const palette = ["#1d3851", "#c65336", "#57846d", "#d2933a", "#6c7894", "#795b70"];
  const usedVariations = new Set();

  function hash(value) {
    return [...value].reduce((result, character) =>
      (result * 31 + character.charCodeAt(0)) >>> 0, 17);
  }

  function identify(product) {
    const name = product.name.toLocaleLowerCase("es");
    if (/espinilleras mma/.test(name)) return "mma-shinguards";
    if (/espinilleras/.test(name)) return "shinguards";
    if (/botines|cleats/.test(name)) return "cleats";
    if (/zapatillas/.test(name)) return "shoes";
    if (/bal[oó]n/.test(name)) return "ball";
    if (/conos/.test(name)) return "cones";
    if (/petos/.test(name)) return "training-bibs";
    if (/bomba/.test(name)) return product.categoryId === "ciclismo" ? "bike-pump" : "ball-pump";
    if (/guantes de arquero/.test(name)) return "goalkeeper-gloves";
    if (/guantes mma/.test(name)) return "mma-gloves";
    if (/guantes/.test(name)) return "training-gloves";
    if (/vendas/.test(name)) return "hand-wraps";
    if (/protector bucal/.test(name)) return "mouthguard";
    if (/short|pantal[oó]n/.test(name)) return "shorts";
    if (/camiseta|polo/.test(name)) return "jersey";
    if (/sudadera|chaqueta/.test(name)) return "jacket";
    if (/leggings/.test(name)) return "leggings";
    if (/top deportivo/.test(name)) return "sports-bra";
    if (/medias/.test(name)) return "socks";
    if (/antivibrador/.test(name)) return "racket-damper";
    if (/bolso para raquetas/.test(name)) return "racket-bag";
    if (/raqueta/.test(name)) return "racket";
    if (/pelotas/.test(name)) return "ball-pack";
    if (/overgrip|grip/.test(name)) return "grip-tape";
    if (/bolso para raquetas/.test(name)) return "racket-bag";
    if (/bolso|mochila|organizador/.test(name)) return "bag";
    if (/muñequera/.test(name)) return "wristbands";
    if (/banda para la cabeza|gorra|sombrero|visera/.test(name)) return "headwear";
    if (/manga|manguitos/.test(name)) return "arm-sleeve";
    if (/red/.test(name)) return "net";
    if (/saco de golpeo/.test(name)) return "punching-bag";
    if (/cuerda de resistencia/.test(name)) return "resistance-bands";
    if (/cuerda|comba/.test(name)) return "rope";
    if (/coquilla/.test(name)) return "groin-guard";
    if (/rodilleras/.test(name)) return "knee-pads";
    if (/cinta para dedos|cinta m[eé]trica/.test(name)) return "tape";
    if (/botella|shaker|cantimplora/.test(name)) return "bottle";
    if (/reloj/.test(name)) return "watch";
    if (/luz|luces|linterna|l[aá]mpara/.test(name)) return "light";
    if (/banda reflectiva/.test(name)) return "reflective-band";
    if (/casco/.test(name)) return "helmet";
    if (/portabotella/.test(name)) return "bottle-cage";
    if (/kit de reparaci[oó]n/.test(name)) return "repair-kit";
    if (/toalla/.test(name)) return "towel";
    if (/candado/.test(name)) return "lock";
    if (/lentes/.test(name)) return "sports-glasses";
    if (/mancuernas|kettlebell/.test(name)) return "weight";
    if (/mat de yoga/.test(name)) return "rolled-mat";
    if (/bandas el[aá]sticas|cuerda de resistencia/.test(name)) return "resistance-bands";
    if (/rodillo/.test(name)) return "foam-roller";
    if (/bloques de yoga/.test(name)) return "yoga-blocks";
    if (/rueda abdominal/.test(name)) return "ab-wheel";
    if (/suspensi[oó]n/.test(name)) return "suspension-trainer";
    if (/gafas/.test(name)) return "swim-goggles";
    if (/gorro de nataci[oó]n/.test(name)) return "swim-cap";
    if (/pull buoy/.test(name)) return "pull-buoy";
    if (/aletas/.test(name)) return "swim-fins";
    if (/tabla de nataci[oó]n/.test(name)) return "kickboard";
    if (/tapones/.test(name)) return "earplugs";
    if (/paletas/.test(name)) return "swim-paddles";
    if (/sandalias/.test(name)) return "sandals";
    if (/bastones de trekking/.test(name)) return "trekking-poles";
    if (/br[uú]jula/.test(name)) return "compass";
    if (/manta t[eé]rmica/.test(name)) return "thermal-blanket";
    if (/bolsa seca/.test(name)) return "dry-bag";
    if (/primeros auxilios/.test(name)) return "first-aid-kit";
    if (/canguro/.test(name)) return "waist-pack";
    if (/toalla/.test(name)) return "towel";
    if (/cintur[oó]n/.test(name)) return "running-belt";
    if (/bomba port[aá]til/.test(name)) return "bike-pump";
    if (/impermeable/.test(name)) return "dry-bag";
    if (/t[eé]rmica/.test(name)) return "insulated-bottle";
    if (/botella/.test(name)) return "bottle";
    throw new Error(`Falta una ilustración de producto para «${product.name}» (${product.id}).`);
  }

  function draw(type, color, accent) {
    const ball = (segments, stroke) => `
      <circle cx="180" cy="145" r="72" fill="${color}" stroke="${stroke}" stroke-width="9"/>
      ${segments}
      <ellipse cx="180" cy="275" rx="85" ry="9" fill="#17324d" opacity=".12"/>`;
    const shoe = (cleats) => `
      <path d="M68 180c30-1 52-17 66-58l34 18c17 31 44 52 83 64 22 7 39 24 42 43l-2 14H79c-20 0-34-13-34-31 0-22 9-42 23-50Z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/>
      <path d="m142 135 31 12m-40 5 29 12m-41 3 29 13" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>
      <path d="M70 230c54 7 129-4 223 20l-2 14H79c-18 0-28-12-31-25l22-9Z" fill="#fff" stroke="#17324d" stroke-width="7"/>
      ${cleats ? '<path d="m101 260-6 19m50-16-3 18m54-14 1 17m46-12 5 15" stroke="#17324d" stroke-width="7" stroke-linecap="round"/>' : ""}`;
    const shirt = (sleeves, collar) => `
      <path d="M142 57 180 77l38-20 57 28-25 61-31-15v130H141V131l-31 15-25-61 57-28Z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/>
      <path d="${collar}" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>
      <path d="${sleeves}" fill="none" stroke="${accent}" stroke-width="5" opacity=".9"/>`;
    const pairGuards = (mma) => `
      <g stroke="#17324d" stroke-width="7" stroke-linejoin="round">
        <path d="M91 79Q121 57 149 77l14 120q-2 20-29 30l-33 18q-19-10-18-29Z" fill="${color}"/>
        <path d="M212 77q28-20 58 2l8 137q1 19-18 29l-33-18q-27-10-29-30Z" fill="${accent}"/>
      </g>
      <path d="M99 98q23-15 48 0l10 92q-19 20-44 27l-16-15Zm120 0q25-15 48 0l-2 104q-25-7-44-27Z" fill="#fff" opacity=".24"/>
      ${mma ? '<path d="M89 126h68M87 159h72M217 126h62M216 159h63" stroke="#17324d" stroke-width="9" stroke-linecap="round"/>' : '<g fill="#f4f1e8"><circle cx="123" cy="123" r="6"/><circle cx="125" cy="151" r="6"/><circle cx="244" cy="123" r="6"/><circle cx="242" cy="151" r="6"/></g>'}`;
    const glove = (open) => `
      <g stroke="#17324d" stroke-width="8" stroke-linejoin="round">
        <path d="M94 204v-76q0-15 15-15t15 15V89q0-15 15-15t15 15v45-66q0-15 15-15t15 15v66-39q0-15 15-15t15 15v50l19-20q15-13 26-1t0 27l-37 48q-14 18-35 18h-48q-26 0-26-28Z" fill="${color}"/>
        <path d="M118 207h119v44H118z" fill="${accent}"/>
      </g>
      ${open ? '<path d="M125 112v28m30-51v28m30-10v23" stroke="#f4f1e8" stroke-width="7" stroke-linecap="round"/>' : '<path d="M125 117q47-27 96 4" fill="none" stroke="#f4f1e8" stroke-width="8"/> '}`;
    const bottle = (shaker) => `
      <path d="M154 52h52v23h-52z" fill="${accent}" stroke="#17324d" stroke-width="7"/>
      <path d="M148 75h64l12 20v137q0 18-18 18h-52q-18 0-18-18V95Z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/>
      ${shaker ? '<path d="m150 115 60 70m1-70-61 70" stroke="#f4f1e8" stroke-width="5" opacity=".75"/>' : '<path d="M151 143h58m-58 30h58" stroke="#f4f1e8" stroke-width="7" opacity=".85"/>'}`;
    const miniBag = (strap) => `
      <path d="M86 116q0-22 22-22h144q22 0 22 22v110q0 20-20 20H106q-20 0-20-20Z" fill="${color}" stroke="#17324d" stroke-width="8"/>
      ${strap ? '<path d="M113 125q0-57 76-57t76 57" fill="none" stroke="#17324d" stroke-width="10"/>' : ""}
      <path d="M99 153h162" stroke="${accent}" stroke-width="8"/>
      <rect x="159" y="156" width="42" height="36" rx="7" fill="#f4f1e8" stroke="#17324d" stroke-width="6"/>`;
    const templates = {
      ball: ball(`<path d="m180 105 26 19-10 30h-32l-10-30 26-19Zm0 0V75m26 49 31-10m-41 40 15 31m-57-31-30 20m25-50-31-10m17 71-14-31m58 0 25 19" fill="none" stroke="${accent}" stroke-width="8" stroke-linejoin="round"/>`, "#17324d"),
      cones: `<path d="m180 69 81 171H99Z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/><path d="M138 160h84M121 197h119" stroke="${accent}" stroke-width="11"/><path d="M87 241h186" stroke="#17324d" stroke-width="8" stroke-linecap="round"/>`,
      "training-bibs": shirt("M93 91 67 135l33 24m147-68 26 44-33 24", "M163 68q17 18 34 0"),
      shinguards: pairGuards(false),
      "mma-shinguards": pairGuards(true),
      cleats: shoe(true),
      shoes: shoe(false),
      "ball-pump": `<rect x="157" y="89" width="48" height="151" rx="14" fill="${color}" stroke="#17324d" stroke-width="8"/><path d="M181 91V66m-34 0h68v22h-68zM181 241v28m-17 0h34m-8-148 58-57" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M248 64v-15" stroke="#17324d" stroke-width="7"/>`,
      "bike-pump": `<rect x="161" y="77" width="38" height="171" rx="12" fill="${color}" stroke="#17324d" stroke-width="8"/><path d="M180 79V54m-39 0h78v23h-78zm39 194v-25m-18 25h36m-20-153 44-30m-62 89h36" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M223 64v-14" stroke="#17324d" stroke-width="7"/>`,
      "goalkeeper-gloves": glove(false),
      "mma-gloves": glove(true),
      "training-gloves": glove(true),
      "hand-wraps": `<path d="M101 120h79v92h-79zm108 0h70v92h-70z" fill="${color}" stroke="#17324d" stroke-width="8"/><path d="M112 135h57v22h-57zm106 0h47v22h-47zM140 213v25q0 19 19 19t19-19v-25m48 0v25q0 19 19 19t19-19v-25" fill="${accent}" stroke="#17324d" stroke-width="7" stroke-linejoin="round"/>`,
      mouthguard: `<path d="M103 139q77-69 154 0l-19 53q-58 39-116 0Z" fill="${color}" stroke="#17324d" stroke-width="8"/><path d="M122 148q58-40 116 0l-12 28q-46 29-92 0Z" fill="#fff" stroke="${accent}" stroke-width="8"/><path d="M152 183v19m28-23v27m28-27v23" stroke="#17324d" stroke-width="5"/>`,
      shorts: `<path d="M103 69h154l-12 82-22 119h-52l-14-98-16 98H91L99 151Z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/><path d="M105 96h146m-106-27v56m42-56v56" stroke="${accent}" stroke-width="8"/>`,
      jersey: shirt("", "M160 65q20 30 40 0"),
      jacket: `<path d="m145 62 35 17 35-17 49 28-25 54-25-12v119H126V132l-25 12-25-54 49-28Z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/><path d="M180 80v171m-20-117h40m-40 46h40" stroke="${accent}" stroke-width="7"/><path d="M156 49q24 29 48 0" fill="none" stroke="#17324d" stroke-width="8"/>`,
      activewear: `<path d="M115 66q34-20 65 0l-4 55-9 12-9-12-4-55m9 0q29-20 64 0l-4 55-9 12-9-12-4-55M115 120h101v104q-50 30-101 0Z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/><path d="M116 151h100m-95 49h90" stroke="${accent}" stroke-width="8"/>`,
      leggings: `<path d="M116 65h128l-11 81-12 122h-48l-9-88-12 88h-48l-9-122Z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/><path d="M120 87h120m-91 22-4 53m48-53 5 53m-90-22h22m55 0h23" stroke="${accent}" stroke-width="8"/>`,
      "sports-bra": `<path d="M120 77q30-25 60 0 30-25 60 0l23 100q-83 49-166 0Z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/><path d="M130 102q19 53 50 30 31 23 50-30m-94 81h88M150 65l8 57m44-57-8 57" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`,
      socks: `<path d="M120 57h71v117q0 20 22 20h42v51h-71q-52 0-52-49V57Zm96 0h48v112h-48z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/><path d="M126 81h59m-59 17h59m-12 81 39 0" stroke="${accent}" stroke-width="8"/>`,
      racket: `<ellipse cx="168" cy="117" rx="58" ry="77" transform="rotate(28 168 117)" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="m203 177 70 78m-76-161 42 72m-82-82 54 91m-85-72 62 81m-46-103 34 110m24-122-48 104m78-90-65 83m88-53-100 55" stroke="${accent}" stroke-width="4"/><path d="m202 183 73 80" stroke="#17324d" stroke-width="15" stroke-linecap="round"/>`,
      "ball-pack": `<g fill="${color}" stroke="#17324d" stroke-width="7"><circle cx="137" cy="173" r="47"/><circle cx="220" cy="173" r="47"/><circle cx="180" cy="109" r="47"/></g><path d="M139 130q-24 34 0 78m81-78q24 34 0 78m-53-99q-23 34 0 77" fill="none" stroke="${accent}" stroke-width="6"/>`,
      "racket-damper": `<circle cx="180" cy="149" r="72" fill="none" stroke="#17324d" stroke-width="18"/><path d="M130 100 230 198m0-98L130 198" stroke="${accent}" stroke-width="13" stroke-linecap="round"/><circle cx="180" cy="149" r="24" fill="${color}" stroke="#17324d" stroke-width="7"/>`,
      "grip-tape": `<path d="M119 65h100v24h-26v123q0 32-32 32h-25q-32 0-32-32v-27h27v27h25V89h-37Z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/><path d="M121 103h70m-70 20h70m-70 20h70m-70 20h70" stroke="${accent}" stroke-width="6"/>`,
      "racket-bag": miniBag(true),
      wristbands: `<path d="M92 135q0-39 40-39h85q40 0 40 39v52q0 40-40 40h-85q-40 0-40-40Z" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M108 126v69m132-69v69" stroke="${accent}" stroke-width="12"/>`,
      headwear: `<path d="M91 176q0-89 88-102 91 11 105 102H91Z" fill="${color}" stroke="#17324d" stroke-width="8"/><path d="M92 176h192q-7 39-93 39t-99-39Zm87-99v90" fill="${accent}" stroke="#17324d" stroke-width="7"/>`,
      "arm-sleeve": `<path d="M127 70q53-28 106 0l-15 169q-38 18-76 0Z" fill="${color}" stroke="#17324d" stroke-width="8"/><path d="m124 100 111 10m-116 108 103 8" stroke="${accent}" stroke-width="12"/>`,
      net: `<path d="M84 78h192v177H84z" fill="${color}" fill-opacity=".19" stroke="#17324d" stroke-width="9"/><path d="M122 79v175m38-175v175m38-175v175m39-175v175M85 122h190m-190 44h190m-190 44h190" stroke="${accent}" stroke-width="5"/><path d="M72 78h216m-205-15v15m194-15v15" stroke="#17324d" stroke-width="8" stroke-linecap="round"/>`,
      "punching-bag": `<path d="M137 87q43-36 86 0l-5 25q36 28 27 92-10 73-65 73t-65-73q-9-64 27-92Z" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M145 115h70m-76 120h82M160 85v-31h40v31" fill="none" stroke="${accent}" stroke-width="9"/>`,
      rope: `<path d="M108 73q0 131 72 131t72-131" fill="none" stroke="${color}" stroke-width="13"/><rect x="90" y="55" width="37" height="81" rx="15" fill="${accent}" stroke="#17324d" stroke-width="7" transform="rotate(-14 108 95)"/><rect x="233" y="55" width="37" height="81" rx="15" fill="${accent}" stroke="#17324d" stroke-width="7" transform="rotate(14 251 95)"/>`,
      "knee-pads": `<g fill="${color}" stroke="#17324d" stroke-width="8"><path d="M94 112q31-34 67 0l-8 100q-25 30-52 0Z"/><path d="M198 112q31-34 67 0l-8 100q-25 30-52 0Z"/></g><path d="M108 146h38m-37 25h38m65-25h38m-37 25h38" stroke="${accent}" stroke-width="7"/>`,
      tape: `<path d="M96 119q0-30 31-30h103q31 0 31 30v58q0 31-31 31H127q-31 0-31-31Z" fill="${color}" stroke="#17324d" stroke-width="8"/><circle cx="180" cy="148" r="31" fill="#f4f1e8" stroke="${accent}" stroke-width="8"/><path d="M180 89V63h93v104h-12" fill="none" stroke="${accent}" stroke-width="10"/>`,
      bottle: bottle(false),
      "insulated-bottle": bottle(true),
      watch: `<circle cx="180" cy="151" r="68" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M158 82V54h44v28m-44 137v29h44v-29" fill="${accent}" stroke="#17324d" stroke-width="8"/><circle cx="180" cy="151" r="47" fill="#f4f1e8" stroke="#17324d" stroke-width="6"/><path d="M180 116v38l26 15" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"/>`,
      light: `<path d="M138 82h84l14 28v108l-17 25h-78l-17-25V110Z" fill="${color}" stroke="#17324d" stroke-width="8"/><circle cx="180" cy="157" r="42" fill="#f4f1e8" stroke="#17324d" stroke-width="8"/><circle cx="180" cy="157" r="24" fill="${accent}"/><path d="M146 82V62h68v20m-47 165v17m28-17v17" stroke="#17324d" stroke-width="8" stroke-linecap="round"/>`,
      "reflective-band": `<path d="M97 128q83-59 166 0v53q-83 59-166 0Z" fill="${color}" stroke="#17324d" stroke-width="8"/><path d="M105 148q75-44 150 0v15q-75-44-150 0Z" fill="#fff" stroke="${accent}" stroke-width="6"/>`,
      helmet: `<path d="M78 178q0-100 102-112 100 12 102 112H78Z" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M82 177h196q-15 38-98 38t-98-38Zm100-107v99m-53-82 34 79m74-79-34 79" fill="none" stroke="${accent}" stroke-width="8"/>`,
      "bottle-cage": `<path d="M120 77h120l-10 158q-54 47-100 0Z" fill="none" stroke="${color}" stroke-width="17" stroke-linejoin="round"/><path d="M112 102h135m-123 113h113m-78-138V57h42v20" fill="none" stroke="#17324d" stroke-width="8" stroke-linecap="round"/>`,
      "repair-kit": `<rect x="91" y="100" width="178" height="141" rx="20" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M143 100V75q0-18 18-18h39q18 0 18 18v25m-91 45h106m-80-19v39m54-39v39" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>`,
      lock: `<path d="M115 146v-34q0-65 65-65t65 65v34" fill="none" stroke="${color}" stroke-width="22"/><rect x="87" y="137" width="186" height="121" rx="16" fill="${accent}" stroke="#17324d" stroke-width="9"/><circle cx="180" cy="190" r="15" fill="#f4f1e8"/><path d="M180 202v23" stroke="#f4f1e8" stroke-width="11" stroke-linecap="round"/>`,
      "sports-glasses": `<path d="M69 123q4-34 40-34h47q25 0 24 36l-8 53q-5 28-34 28h-31q-28 0-34-27Zm162 0q4-34 40-34h8q36 0 40 34l-4 56q-5 27-34 27h-22q-29 0-34-28Z" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M180 127q20-18 40 0m-132-6q42-20 88 0m75 0q37-20 75 0" fill="none" stroke="${accent}" stroke-width="9"/>`,
      weight: `<path d="M95 111v77m170-77v77M77 125v49m207-49v49M95 149h170" stroke="${color}" stroke-width="23" stroke-linecap="round"/><path d="M95 111v77m170-77v77M77 125v49m207-49v49" stroke="#17324d" stroke-width="8" stroke-linecap="round"/>`,
      "rolled-mat": `<path d="M117 83h129v143H117z" fill="${color}" stroke="#17324d" stroke-width="8"/><ellipse cx="180" cy="83" rx="63" ry="26" fill="${accent}" stroke="#17324d" stroke-width="8"/><ellipse cx="180" cy="83" rx="31" ry="13" fill="#f4f1e8" stroke="#17324d" stroke-width="6"/><path d="M117 220h129m-104-118v102m26-102v102m26-102v102" stroke="#f4f1e8" stroke-width="5" opacity=".85"/>`,
      "resistance-bands": `<ellipse cx="180" cy="155" rx="91" ry="69" fill="none" stroke="${color}" stroke-width="20"/><ellipse cx="180" cy="155" rx="57" ry="42" fill="none" stroke="${accent}" stroke-width="16"/><path d="M105 235h150" stroke="#17324d" stroke-width="8" stroke-linecap="round"/>`,
      "foam-roller": `<rect x="113" y="76" width="134" height="166" rx="37" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M126 100h108m-108 28h108m-108 28h108m-108 28h108m-108 28h108" stroke="${accent}" stroke-width="11" stroke-linecap="round"/>`,
      "yoga-blocks": `<path d="m87 130 122-52 58 137-122 52Z" fill="${color}" stroke="#17324d" stroke-width="9" stroke-linejoin="round"/><path d="m170 93 58 137m-94-114 122 137" stroke="${accent}" stroke-width="8"/>`,
      "ab-wheel": `<circle cx="180" cy="151" r="64" fill="${color}" stroke="#17324d" stroke-width="12"/><circle cx="180" cy="151" r="34" fill="#f4f1e8" stroke="#17324d" stroke-width="8"/><path d="M81 151h198m-180-20v40m163-40v40" stroke="${accent}" stroke-width="15" stroke-linecap="round"/>`,
      "suspension-trainer": `<path d="M180 54v43m0 0q-91 3-91 75m91-75q91 3 91 75M89 172v60m182-60v60m-182-22h44m94 0h44" fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round"/><path d="M180 54 164 37m16 17 16-17M98 202h27m111 0h27" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>`,
      "swim-goggles": `<path d="M82 113q0-21 22-21h57q22 0 22 23v52q0 27-26 27h-44q-29 0-31-28Zm172 0q0-21 22-21h-57q-22 0-22 23v52q0 27 26 27h44q29 0 31-28Z" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M78 117 49 105m233 12 29-12m-136 15h10" stroke="${accent}" stroke-width="11" stroke-linecap="round"/>`,
      "swim-cap": `<path d="M79 184q0-108 101-116 102 8 101 116-95 42-202 0Z" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M90 176q90 34 180 0m-166-37q75 27 151 0" fill="none" stroke="${accent}" stroke-width="8"/>`,
      "pull-buoy": `<path d="M102 92q-20 0-20 23v34q0 23 20 23h37q20 0 20 21v27q0 21 21 21t21-21v-27q0-21 20-21h37q20 0 20-23v-34q0-23-20-23h-37q-20 0-20-20V54q0-20-21-20t-21 20v18q0 20-20 20Z" transform="translate(0 39) scale(1 .85)" fill="${color}" stroke="#17324d" stroke-width="9"/>`,
      "swim-fins": `<path d="M108 68h64v91q3 42-21 78l-36 39q-20 21-34 7t-1-37l22-62q7-20 6-43Zm80 0h64v73q-1 23 6 43l22 62q13 23-1 37t-34-7l-36-39q-24-36-21-78Z" fill="${color}" stroke="#17324d" stroke-width="9" stroke-linejoin="round"/><path d="M110 92h60m-58 29h57m24-29h60m-58 29h57" stroke="${accent}" stroke-width="8"/>`,
      kickboard: `<path d="M99 96q0-27 27-27h108q27 0 27 27v111q0 27-27 27H126q-27 0-27-27Z" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M109 105q0-16 16-16h100q16 0 16 16v86q0 16-16 16H125q-16 0-16-16Z" fill="none" stroke="${accent}" stroke-width="8"/><path d="M130 143h100" stroke="${accent}" stroke-width="6"/>`,
      earplugs: `<path d="M121 103q0-28 28-28t28 28v78q0 28-28 28t-28-28Zm65 0q0-28 28-28t28 28v78q0 28-28 28t-28-28Z" fill="${color}" stroke="#17324d" stroke-width="8"/><path d="M137 111h24m41 0h24m-70 92q-20 23 0 37m51-37q20 23 0 37" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`,
      towel: `<path d="M110 68h146v181H110z" fill="${color}" stroke="#17324d" stroke-width="8"/><path d="M110 95h146m-146 25h146m-146 104h146m-115-128v153m84-153v153" stroke="${accent}" stroke-width="6"/>`,
      "swim-paddles": `<path d="M99 121q0-55 54-55h19v130q0 50-39 50h-12q-22 0-22-24Zm127-55h19q54 0 54 55v101q0 24-22 24h-12q-39 0-39-50Z" fill="${color}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/><path d="M148 88v119m-30-103h74m62-16v119m-30-103h74" stroke="${accent}" stroke-width="7"/>`,
      sandals: `<path d="M133 58q65-24 99 38 28 53 8 137-7 32-38 34-30 2-40-30-34-107-29-179Zm-68 24q61-39 104 11 39 47 31 137-3 35-33 42-31 7-46-23Q67 153 65 82Z" fill="${color}" stroke="#17324d" stroke-width="8"/><path d="m85 109 42 63m82-72-45 67m-99-37 57 17m50 3 55-21" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>`,
      bag: miniBag(true),
      "trekking-poles": `<path d="m131 60 47 194m54-194-47 194M111 81l39-10m31 12 39-10m-93 177 28-7m40 7 28-7" stroke="${color}" stroke-width="12" stroke-linecap="round"/><path d="m121 63 22-5m78 5 22-5m-91 199-22 10m99-10 22 10" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>`,
      compass: `<circle cx="180" cy="151" r="92" fill="${color}" stroke="#17324d" stroke-width="9"/><circle cx="180" cy="151" r="70" fill="#f4f1e8" stroke="${accent}" stroke-width="7"/><path d="m180 87 23 64-23 64-23-64Z" fill="${accent}" stroke="#17324d" stroke-width="6"/><circle cx="180" cy="151" r="10" fill="#17324d"/>`,
      "thermal-blanket": `<path d="m103 77 151 13-16 151-151-13Z" fill="${color}" stroke="#17324d" stroke-width="8"/><path d="m111 97 128 11m-132 18 128 11m-132 19 128 11m-132 19 128 11m-132 19 128 11" stroke="${accent}" stroke-width="8"/>`,
      "dry-bag": `<path d="M112 98h136l-10 147H122Z" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M104 98h152V75H104Zm0 0q19-23 38 0t38 0 38 0 38 0" fill="${accent}" stroke="#17324d" stroke-width="8" stroke-linejoin="round"/><path d="M180 113v112" stroke="#f4f1e8" stroke-width="7"/>`,
      "first-aid-kit": `<rect x="91" y="103" width="178" height="141" rx="20" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M141 103V77q0-17 17-17h44q17 0 17 17v26" fill="none" stroke="#17324d" stroke-width="9"/><rect x="162" y="132" width="36" height="82" rx="6" fill="${accent}"/><rect x="139" y="155" width="82" height="36" rx="6" fill="${accent}"/>`,
      "waist-pack": `<path d="M58 116q122-45 244 0l-16 110q-106 42-212 0Z" fill="${color}" stroke="#17324d" stroke-width="9"/><path d="M59 142 33 132m268 10 26-10" stroke="#17324d" stroke-width="10" stroke-linecap="round"/><path d="M119 139h122v62H119z" fill="${accent}" stroke="#17324d" stroke-width="8"/><path d="M135 154h90" stroke="#f4f1e8" stroke-width="7"/>`,
      "running-belt": `<path d="M71 111q109-55 218 0v66q-109 55-218 0Z" fill="${color}" stroke="#17324d" stroke-width="8"/><rect x="151" y="125" width="58" height="38" rx="8" fill="${accent}" stroke="#17324d" stroke-width="6"/><path d="M71 139H44m276 0h-27" stroke="#17324d" stroke-width="9"/>`
    };

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 300" role="img"><rect width="360" height="300" fill="#f4f1e8"/><g>${templates[type] || ""}</g></svg>`;
  }

  fs.mkdirSync(imagesDirectory, { recursive: true });
  const ids = new Set();
  catalog.products.forEach((product) => {
    if (!/^[a-z0-9-]+$/.test(product.id) || ids.has(product.id)) {
      throw new Error(`El ID de producto «${product.id}» no es válido o está duplicado.`);
    }
    ids.add(product.id);
    const type = identify(product);
    const value = hash(product.id);
    let variation = value % (palette.length * palette.length);
    let colorIndex;
    let accentIndex;
    for (let attempt = 0; attempt < palette.length * palette.length; attempt++) {
      colorIndex = variation % palette.length;
      accentIndex = Math.floor(variation / palette.length);
      const key = `${type}:${colorIndex}:${accentIndex}`;
      if (!usedVariations.has(key)) {
        usedVariations.add(key);
        break;
      }
      variation = (variation + 1) % (palette.length * palette.length);
    }
    const color = palette[colorIndex];
    const accent = palette[accentIndex];
    const artwork = draw(type, color, accent);
    const imagePath = path.join(imagesDirectory, `${product.id}.svg`);
    fs.writeFileSync(imagePath, `${artwork}\n`, "utf8");
    product.imageUrl = `images/products/${product.id}.svg`;
    product.imageAlt = `${product.name}, ilustración del producto aislado sobre fondo liso`;
    product.imageCredit = "Apex Sports";
    product.imageLicense = "CC BY 4.0";
    product.imageLicenseUrl = "https://creativecommons.org/licenses/by/4.0/";
    product.imageSourceUrl = product.imageUrl;
    product.imageSourceTitle = "Ilustración original Apex Sports";
  });
  fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  console.log(`Ilustraciones originales generadas: ${catalog.products.length}.`);
})();
