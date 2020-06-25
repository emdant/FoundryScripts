// CONFIGURATION
// If one or more tokens are selected, those will be used instead of the listed actors
// Leave the actorNames array empty to guess the players
// Example actorNames: `actorNames: ["Bob", "John"],`
// In skills array put custom skills first and match their index with the labels array index
const config = {
  skills: ["knw", "acr", "apr", "blf", "clm", "crf", "dip", "dev", 
          "dis", "esc", "fly", "han", "hea", "int", "lin", 
          "per", "prf", "pro", "rid", "sen", "slt", "spl",
          "ste", "sur", "swm", "umd"],
  labels: ["Knowledge"],
  withSubskills: ["art", "crf", "knw", "lor", "prf", "pro"],
  unknownSkill: "Unknown Skill"
};
// END CONFIGURATION

async function _rollSkill(type, actor) {
  await actor.rollSkill(type, { event: new MouseEvent({}), skipDialog: true });
};

function actorsSkill(actors) {

  const skillButtons = config.skills.reduce((buttons, skillType, index) => {
    let label = config.labels[index];
    if (label == null) 
      label = `${CONFIG.PF1.skills[skillType]} ` || config.unknownSkill;
    if (actors.length === 1 && !config.withSubskills.includes(skillType) && label !== config.unknownSkill) {
      const mod = actors[0].getSkill(skillType).mod;
      label = label + (mod < 0 ? "" : "+") + mod;
    }

    buttons[skillType] = {
      label: label
    };

    if (skillType === "knw")
      buttons[skillType].callback = () => actors.forEach(actor => actorKnowledge(actor));
    else if (config.withSubskills.includes(skillType))
      buttons[skillType].callback = () => actors.forEach(actor => actorSubSkill(actor, label, skillType));
    else 
      buttons[skillType].callback = () => actors.forEach(actor => _rollSkill(skillType, actor));
    
    return buttons;
  }, {});

  const msg = `Choose a skill to roll for the following actor(s): <strong>${actors.map(o => o.name).join("</strong>, <strong>")}</strong>`;
    new Dialog({
        title: "Roll skill", 
        content: `<p>${msg}</p>`,
        buttons: skillButtons ,
    }).render(true);   

}

function actorSubSkill(actor, skillName, skill) {

  const subSkills = actor.getSkill(skill).subSkills;
  const subSkillTypes = Object.keys(subSkills).filter(name => name.startsWith(skill))
  if (!subSkillTypes.length) {
    return;
  }

  let subSkillButtons = [];
  for (const sub of subSkillTypes) {
    subSkillButtons.push({
      label: `${subSkills[sub].name} +${subSkills[sub].mod}`,
      callback: () => _rollSkill(`${skill}.subSkills.${sub}`, actor),
    });
  }

  const msg = `Choose a ${skillName} skill roll for <strong>${actor.name}</strong>`
    new Dialog({
        title: `Roll ${skillName} skill`, 
        content: `<p>${msg}</p>`,
        buttons: subSkillButtons ,
    }).render(true);
}

function actorKnowledge(actor) {

  const knowledges = ["kar","kdu", "ken", "kge", "khi",
    "klo", "kna", "kno", "kpl", "kre"];

    const knowledgeButtons = knowledges.reduce((buttons, skillType) => {
      let label = `${CONFIG.PF1.skills[skillType]} `;
      const mod = actor.getSkill(skillType).mod;
      label = label + (mod < 0 ? "" : "+") + mod;
    
      buttons[skillType] = {
        label: label,
        callback: () => _rollSkill(skillType, actor),
      };
      return buttons;
    }, {});

    const msg = `Choose a knowledge skill roll for <strong>${actor.name}</strong>`
    new Dialog({
        title: `Roll knowledge skill`, 
        content: `<p>${msg}</p>`,
        buttons: knowledgeButtons,
    }).render(true);
}

// ---- Starts here

const tokens = canvas.tokens.controlled;
const selected = (!tokens.length ? false : true);

let actors = tokens.map(o => o.actor);
if (!actors.length) 
  actors = game.actors.entities.filter(o => o.isPC && o.hasPerm(game.user, "OWNER"));
actors = actors.filter(o => o.hasPerm(game.user, "OWNER"));

if (!actors.length) 
  ui.notifications.warn("No applicable actor(s) found");
else {

  if(selected || actors.length === 1) {
    actorsSkill(actors)
  }
  else if (actors.length > 1) {
      const actorButtons = actors.map(actor => ({label: actor.name, callback: () => actorsSkill([actor])}));
  
      const msg = "Choose an actor for your skill roll";
  
      new Dialog({
        title: "Choose an actor",
        content: `<p>${msg}</p>`,
        buttons: actorButtons,
      }).render(true);
  }

}