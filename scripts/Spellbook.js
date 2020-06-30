const css = `<style>
.spell-dialog-box-buttons .dialog-buttons {
  display: flex; 
  flex-flow: row wrap; 
}

.spell-dialog-box-buttons .dialog-button {
  flex: 1 0 33%;
  width: auto;
  padding: 2px 5px;
}
</style>`;

function spellLevelChoice(actor) {

  const spells = actor.items.filter(item => item.type === "spell");
  const spellsByLevel = spells.reduce((list, spell) => {
    list[spell.data.data.level] = list[spell.data.data.level] || [];
    list[spell.data.data.level].push(spell);
    return list;
  }, []);


  const spellLevelButtons = spellsByLevel.map((cur, index) => {
    return {
      label: `Level ${index}`,
      callback: () => spellChoice(actor, spellsByLevel[index])
    }
  })

  const msg = `Choose a spell level`
  new Dialog({
    title: "Spell level",
      content: `<p>${msg}</p>` + css,
      buttons: spellLevelButtons,
    }, {
      classes: ["spell-dialog-box-buttons"],
  }).render(true);
}

function spellChoice(actor, spells) {
  
  const spellButtons = spells.map(spell => {
    return {
      label: spell.name,
      callback: () => actor.useSpell(spell, new MouseEvent({})),
    }
  });

  const msg = `Choose a spell to cast`
  new Dialog({
    title: "Choose spell",
      content: `<p>${msg}</p>` + css,
      buttons: spellButtons,
    }, {
      classes: ["spell-dialog-box-buttons"],
      resizable: true,
  }).render(true);
}


const tokens = canvas.tokens.controlled;
let actors = tokens.map(o => o.actor);
if (!actors.length)
  actors = game.actors.entities.filter(o => o.isPC && o.hasPerm(game.user, "OWNER"));
actors = actors.filter(o => o.hasPerm(game.user, "OWNER"));

if (!actors.length)
  ui.notifications.warn("No applicable actor(s) found");
else {
  if (actors.length === 1) {
    spellLevelChoice(actors[0])
  }
  else {
    const actorButtons = actors.map(actor => ({ label: actor.name, callback: () => spellLevelChoice(actor) }));

    const msg = "Choose an actor";

    new Dialog({
      title: "Choose an actor",
      content: `<p>${msg}</p>` + css,
      buttons: actorButtons,
    }, {
      classes: ["spell-dialog-box-buttons"],
    }).render(true);
  }
}