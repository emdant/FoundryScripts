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
const css = `<style>
.skill-dialog-box-buttons .dialog-buttons {
  display: flex; 
  flex-flow: row wrap; 
}

.skill-dialog-box-buttons .dialog-button {
  flex: 1 0 33%;
  width: auto;
  padding: 2px 5px;
}
</style>`;
// END CONFIGURATION

async function _rollSkill(skillId, actor) {
  await actor.rollSkill(skillId, { event: new MouseEvent({}), skipDialog: true });
};

function actorsSkill(actors) {

  const skillButtons = config.skills.reduce((buttons, skillId, index) => {
    let label = config.labels[index];
    if (label == null) 
      label = `${CONFIG.PF1.skills[skillId]} ` || config.unknownSkill;
    if (actors.length === 1 && !config.withSubskills.includes(skillId) && label !== config.unknownSkill) {
      const mod = actors[0].getSkill(skillId).mod;
      label = label + (mod < 0 ? "" : "+") + mod;
    }

    buttons[skillId] = {
      label: label
    };

    if (skillId === "knw")
      buttons[skillId].callback = () => actors.forEach(actor => actorKnowledge(actor));
    else if (config.withSubskills.includes(skillId))
      buttons[skillId].callback = () => actors.forEach(actor => actorSubSkill(actor, label, skillId));
    else 
      buttons[skillId].callback = () => actors.forEach(actor => _rollSkill(skillId, actor));
    
    return buttons;
  }, {});

  const msg = `Choose a skill to roll for the following actor(s): <strong>${actors.map(o => o.name).join("</strong>, <strong>")}</strong>`;
    new Dialog({
        title: "Roll skill", 
        content: `<p>${msg}</p>` + css,
        buttons: skillButtons ,
    }, {
      classes: ["skill-dialog-box-buttons"],
    }).render(true);   

}

function actorSubSkill(actor, skillName, skill) {

  const subSkills = actor.getSkill(skill).subSkills;
  const subSkillIds = Object.keys(subSkills).filter(name => name.startsWith(skill))
  if (!subSkillIds.length) {
    return;
  }

  let subSkillButtons = [];
  for (const sub of subSkillIds) {
    subSkillButtons.push({
      label: `${subSkills[sub].name} +${subSkills[sub].mod}`,
      callback: () => _rollSkill(`${skill}.subSkills.${sub}`, actor),
    });
  }

  const msg = `Choose a ${skillName} skill roll for <strong>${actor.name}</strong>`
    new Dialog({
        title: `Roll ${skillName} skill`, 
        content: `<p>${msg}</p>` + css,
        buttons: subSkillButtons ,
    }, {
      classes: ["skill-dialog-box-buttons"],
    }).render(true);
}

function actorKnowledge(actor) {

  const knowledges = ["kar","kdu", "ken", "kge", "khi",
    "klo", "kna", "kno", "kpl", "kre"];

    const knowledgeButtons = knowledges.reduce((buttons, skillId) => {
      let label = `${CONFIG.PF1.skills[skillId]} `;
      const mod = actor.getSkill(skillId).mod;
      label = label + (mod < 0 ? "" : "+") + mod;
    
      buttons[skillId] = {
        label: label,
        callback: () => _rollSkill(skillId, actor),
      };
      return buttons;
    }, {});

    const msg = `Choose a knowledge skill roll for <strong>${actor.name}</strong>`
    new Dialog({
        title: `Roll knowledge skill`, 
        content: `<p>${msg}</p>` + css,
        buttons: knowledgeButtons,
    }, {
      classes: ["skill-dialog-box-buttons"],
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

  if (selected || actors.length === 1) {
    actorsSkill(actors)
  }
  else if (actors.length > 1) {
      const actorButtons = actors.map(actor => ({label: actor.name, callback: () => actorsSkill([actor])}));
  
      const msg = "Choose an actor for your skill roll";

  
      new Dialog({
        title: "Choose an actor",
        content: `<p>${msg}</p>` + css,
        buttons: actorButtons,
      }, {
        classes: ["skill-dialog-box-buttons"],
      }).render(true);
  }

}