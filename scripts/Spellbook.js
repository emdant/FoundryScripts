/**   Configuration   **/
//  
//  Change favoritesItemName value to the item name storing favorite spells in your inventory,
//  in the item description you have to list your favorite spells name, one on each line.
//  Mind that item names and spell names are case sensitive.
//  You can also change the button label of the favorites button.
//
const favoritesItemName = "Favorites";
const favoritesButtonName = "Favorites";

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
  }, {});


  const spellLevelButtons = Object.keys(spellsByLevel).map((cur) => {
    return {
      label: `Level ${cur}`,
      callback: () => spellChoice(actor, spellsByLevel[cur])
    }
  })

  console.log(spellLevelButtons);

  const favoritesButton = {
    label: `<b>${favoritesButtonName}<b>`,
    callback: () => makeFavorites(actor),
  }

  const msg = `Choose a spell level`
  new Dialog({
    title: "Spell level",
      content: `<p>${msg}</p>` + css,
      buttons: [...spellLevelButtons, favoritesButton],
    }, {
      classes: ["spell-dialog-box-buttons"],
  }).render(true);
}

function spellChoice(actor, spells) {
  
  const spellButtons = spells.map(spell => {
    let label = spell.name;
    if (spell.charges > 0) {
      label = `<b>${label}</b>`;
    }

    if (spell.spellbook.name === "Spell-likes") {
      label += " (SL)";
    }

    return {
      label: label,
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

function makeFavorites(actor) {
  const favoritesItem = actor.items.find(item => item.data.name === favoritesItemName && item.data.type === "loot");
  if(!favoritesItem) {
    ui.notifications.warn(`To use favorites spells, you have to create an item in your inventory named ${favoritesItemName}, listing your favorite spells in the description.`);
    return;
  }

  const favoriteSpellNames = (new DOMParser()).parseFromString(favoritesItem.data.data.description.value.replace(/<br ?\/?>/g, '\n'), 'text/html')
    .body.innerText.split(/[\r\n]+[\s]*/)
    .map((spellName => spellName.toLowerCase()));

  const allSpells = actor.items.filter(item => item.type === "spell");

  const favoriteSpells = allSpells.reduce((favSpells, spell) => {
    if(favSpells.length === favoriteSpellNames.length)
      return favSpells;

    if(favoriteSpellNames.includes(spell.data.name.toLowerCase()))
      favSpells.push(spell);

    return favSpells;
  }, []);

  spellChoice(actor, favoriteSpells);
}


const tokens = canvas.tokens.controlled;
let actors = tokens.map(o => o.actor);
if (!actors.length)
  actors = game.actors.entities.filter(o => o.hasPlayerOwner && o.hasPerm(game.user, "OWNER"));
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