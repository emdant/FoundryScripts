const css = `<style>
.ability-dialog-box-buttons .dialog-buttons {
  display: flex; 
  flex-flow: row wrap; 
}

.ability-dialog-box-buttons .dialog-button {
  flex: 1 0 33%;
  width: auto;
  padding: 2px 5px;
}
</style>`;

async function _rollAbility(abilityId, actor) {
    await actor.rollAbility(abilityId, { event: new MouseEvent({}), skipDialog: true });
  };

function actorsAbility(actors) {
    const abilityIds = Object.keys(CONFIG.PF1.abilities);

    const abilityButtons = abilityIds.map((ability) => {
      let label = `${CONFIG.PF1.abilities[ability]} `;
      if (actors.length === 1)  {
        const mod = actors[0].data.data.abilities[ability].mod;
        label = label + (mod < 0 ? "" : "+") + mod;
      }

      return {
          label: label,
          callback: () => actors.forEach(actor => _rollAbility(ability, actor)),
        }
    });

    const msg = `Choose an ability to roll for the following actor(s): <strong>${actors.map(o => o.name).join("</strong>, <strong>")}</strong>`;
    new Dialog({
        title: "Roll ability", 
        content: `<p>${msg}</p>` + css,
        buttons: abilityButtons,
    }, {
      classes: ["ability-dialog-box-buttons"],
    }).render(true);   

}

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
    actorsAbility(actors)
  }
  else if (actors.length > 1) {
      const actorButtons = actors.map(actor => ({label: actor.name, callback: () => actorsAbility([actor])}));
  
      const msg = "Choose an actor for your ability roll";
  
      new Dialog({
        title: "Choose an actor",
        content: `<p>${msg}</p>` + css,
        buttons: actorButtons,
      }, {
        classes: ["ability-dialog-box-buttons"],
      }).render(true);
  }

}