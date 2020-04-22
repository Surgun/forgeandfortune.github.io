"use strict";

const SkillManager = {
    skills : [],
    skillEffects : [],
    addSkill(skill) {
        this.skills.push(skill);
    },
    idToSkill(id) {
        return this.skills.find(skill => skill.id === id);
    },
}

const PlaybookManager = {
    playbookDB : [],
    addPlaybookTemplate(pb) {
        this.playbookDB.push(pb);
    },
    idToPlaybook(id) {
        return this.playbookDB.find(playbook => playbook.id === id);
    },
    generatePlayBook(playbookID) {
        const playbookTemplate = this.idToPlaybook(playbookID);
        return new Playbook(playbookTemplate);
    },
    generatePlayBookFromSkills(s1,s2,s3,s4) {
        const skills = {skill1:s1,skill2:s2,skill3:s3,skill4:s4};
        return new Playbook(skills);
    }
}

class playBookTemplate {
    constructor (props) {
        Object.assign(this, props);
    }
    skillIDs() {
        return [this.skill1,this.skill2,this.skill3,this.skill4];
    }
}

class Skill {
    constructor (props) {
        Object.assign(this, props);
        this.powerPercent = (props.powMod * 100).toString() + "%";
        this.techPercent = (props.techMod * 100).toString() + "%";
    }
    passiveCheck(type,target,attack) {
        SkillManager.skillEffects[this.id](type,target,attack);
    }
}

class Playbook {
    constructor (pbTemplate) {
        Object.assign(this, pbTemplate);
        this.skills = [
            SkillManager.idToSkill(pbTemplate.skill1),
            SkillManager.idToSkill(pbTemplate.skill2),
            SkillManager.idToSkill(pbTemplate.skill3),
            SkillManager.idToSkill(pbTemplate.skill4),
        ];
        this.position = 0;
    }
    reset() {
        this.position = 0;
    }
    nextSkill() {
        const skill = this.skills[this.position];
        this.position += 1;
        if (this.position >= 4) this.position = 0;
        return skill;
    }
    getSkillIcons() {
        return this.skills.map(s=>s.icon);
    }
    getSkillIDs() {
        return this.skills.map(s=>s.id);
    }
    skillCount() {
        return this.position;
    }
}

SkillManager.skillEffects['S0000'] = function(combatParams) {
    //Regular Attack
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams)
    });
}

  //------------------//
 //    HERO SKILLS   //
//------------------//

SkillManager.skillEffects['S0010'] = function (combatParams) {
    //Reinforce - Beorn
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => BuffManager.generateBuff('B0010',target));
}

SkillManager.skillEffects['S0020'] = function (combatParams) {
    //Toughen - Cedric
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => {
        if (target.getBuffStacks('B0020') === 5) return;
        BuffManager.generateBuff('B0020',target,combatParams.power)
        target.heal(combatParams.power);
        refreshHPBar(target);
    });
}

SkillManager.skillEffects['S0030'] = function (combatParams) {
    //Exert - Grim
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    let hpDamage = 0;
    targets.forEach(target => {
        hpDamage = Math.floor(target.hp/10);
        target.takeDamagePercent(15);
        refreshHPBar(target);
    });
    combatParams.power += hpDamage * 2;
    const targets2 = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets2.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['S0040'] = function (combatParams) {
    //Frontload - Lambug
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    const selfTarget = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    combatParams.power -=  0.5*selfTarget.getBuffStacks("B0040");
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
    BuffManager.generateBuff("B0040",selfTarget,0);
}

SkillManager.skillEffects['S1010'] = function (combatParams) {
    //Meteor - Zoe
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff("B1010",target,Math.floor(combatParams.power/10));
    });
};

SkillManager.skillEffects['S1020'] = function (combatParams) {
    //Frost Strike - Neve
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    const originalPower = combatParams.power;
    targets.forEach(target => {
        if (target.isChilled()) {
            combatParams.power = Math.floor(2.5 * originalPower);
            target.takeAttack(combatParams);
        }
        else {
            target.takeAttack(combatParams);
            BuffManager.generateBuff("B1020",target,0);
        }
    });
};

SkillManager.skillEffects['S1030'] = function (combatParams) {
    //Transfer Life - Grim
    const lifeDrain = combatParams.getTarget(TargetType.BEFORE,SideType.ALLIES);
    if (lifeDrain === null) return;
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    lifeDrain.forEach(target => {
        target.takeAttack(combatParams);
    })
    targets.forEach(target => {
        BuffManager.generateBuff("B1030",target,combatParams.power);
    });
};

SkillManager.skillEffects['S1040'] = function (combatParams) {
    //Holy Prayer - Titus
    const targets = combatParams.getTarget(TargetType.MISSINGHP,SideType.ALLIES);
    targets.forEach(target => {
        target.heal(combatParams.power);
    });
};

SkillManager.skillEffects['S2010'] = function (combatParams) {
    //Inspiration - Alok
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    targets.forEach(target => {
        BuffManager.generateBuff("B2010",target,Math.floor(combatParams.power));
    });
};

SkillManager.skillEffects['S2020'] = function (combatParams) {
    //Snipe - Grogmar
    const targets = combatParams.getTarget(TargetType.LOWESTHP,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
};

SkillManager.skillEffects['S2030'] = function (combatParams) {
    //Double Tap - Revere
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        target.takeAttack(combatParams);
    });
};

SkillManager.skillEffects['S2040'] = function (combatParams) {
    //Mark - Caeda
    const targets = combatParams.getTarget(TargetType.SECOND,SideType.ENEMIES);
    targets.forEach(target => {
        BuffManager.generateBuff("B2040",target,0);
        target.takeAttack(combatParams);
    });
};


  //------------------//
 //     MOB SKILLS   //
//------------------//

SkillManager.skillEffects['SM100'] = function (combatParams) {
    //swift strike - Elf Adventurer
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => target.takeAttack(combatParams));
    const secondaryTargets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    secondaryTargets.forEach(target => target.heal(combatParams.power));
}

SkillManager.skillEffects['SM101'] = function (combatParams) {
    //Green Ooze - Regenerate
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => target.heal(combatParams.power));
}

SkillManager.skillEffects['SM102'] = function (combatParams) {
    //Monster A - Wilt
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff('BM102',target,combatParams.power);
    });
}

SkillManager.skillEffects['SM103'] = function (combatParams) {
    //Monster A - Attack A
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    const selfTarget = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    if (selfTarget.hp === selfTarget.maxHP()) combatParams.power = Math.floor(combatParams.power*1.5);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM200'] = function (combatParams) {
    //Translucent - Blinkie
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => {
        BuffManager.generateBuff('BM200',target,combatParams.power);
    });
}

SkillManager.skillEffects['SM201'] = function (combatParams) {
    //Purge - Earth Shaman
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    const debuffCount = targets.reduce((a,b) => a + b.debuffCount(),0);
    const originalPower = combatParams.power;
    targets.forEach(target => {
        target.removeDebuffs();
    });
    if (debuffCount > 0) {
        const targets2 = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
        combatParams.power = originalPower * debuffCount;
        targets2.forEach(target => {
            target.takeAttack(combatParams);
        });
    }
}

SkillManager.skillEffects['SM202'] = function (combatParams) {
    //Monster B - OverPower
    const originalDmg = combatParams.power;
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        if (target.underHalfHP()) combatParams.power = Math.floor(originalDmg * 1.5);
        else combatParams.power = originalDmg;
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM203'] = function (combatParams) {
    //Monster B - Attack B
    const targets = combatParams.getTarget(TargetType.MISSINGHP,SideType.ALLIES);
    targets.forEach(target => {
        target.heal(combatParams.power);
    });
};

SkillManager.skillEffects['SM300'] = function (combatParams) {
    //Ray Gun - Dusty Alien
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM301'] = function (combatParams) {
    //Crab Hammer - Crusty Crab
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        combatParams.power = Math.floor(target.maxHP() * 0.25);
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM302'] = function (combatParams) {
    //Monster C - Mega Attack
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM303'] = function (combatParams) {
    //Monster C - Attack C
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    const allyCount = combatParams.getTarget(TargetType.ALL,SideType.ALLIES).length-1;
    combatParams.power = Math.floor(combatParams.power * (1+0.5*allyCount));
    targets.forEach(target => {
        target.heal(combatParams.power);
    });
};

  //------------------//
 //    BOSS SKILLS   //
//------------------//

SkillManager.skillEffects['SM901'] = function (combatParams) {
    //Tree Wallop - Loathing Oak
    const targets = combatParams.getTarget(TargetType.SECOND,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM902'] = function (combatParams) {
    //Phoenix Fire - Phoenix
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff('BM902',target,combatParams.power);
    });
}

SkillManager.skillEffects['SM902A'] = function (combatParams) {
    //lol it does nothing
}

SkillManager.skillEffects['SM902B'] = function (combatParams) {
    const target = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    target.state = null;
    target.image = '<img src="/assets/images/enemies/B902.gif">';
    $("#mobImage"+target.uniqueid).html(target.image);
    target.playbook = PlaybookManager.generatePlayBookFromSkills(target.skill1,target.skill2,target.skill3,target.skill4);
    refreshSkillUnit(target);
    BuffManager.removeBuff('BM902A',target)
    BuffManager.generateBuff('BM902B',target,0);
    target.healPercent(100);
}

SkillManager.skillEffects['SM903A'] = function (combatParams) {
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    const thisMob = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    if (this.state === null || this.state === targets.length-1) this.state = 0;
    else this.state += 1;
    const target = targets[this.state];
    if (target.type === "Might") {
        BuffManager.generateBuff('BM903A',thisMob,combatParams.power);
        thisMob.removeBuff("BM903B");
        thisMob.removeBuff("BM903C");
        thisMob.image = '<img src="/assets/images/enemies/BM903A.gif">';
        $("#mobImage"+thisMob.uniqueid).html(thisMob.image);
    }
    else if (target.type === "Mind") {
        thisMob.removeBuff("BM903A");
        BuffManager.generateBuff('BM903B',thisMob,combatParams.power);
        thisMob.removeBuff("BM903C");
        thisMob.image = '<img src="/assets/images/enemies/BM903B.gif">';
        $("#mobImage"+thisMob.uniqueid).html(thisMob.image);
    }
    else if (target.type === "Moxie") {
        thisMob.removeBuff("BM903A");
        thisMob.removeBuff("BM903B");
        BuffManager.generateBuff('BM903C',thisMob,combatParams.power);
        thisMob.image = '<img src="/assets/images/enemies/BM903C.gif">';
        $("#mobImage"+thisMob.uniqueid).html(thisMob.image);
    }
}

SkillManager.skillEffects['SM903A'] = function (combatParams) {
    //PAINTBRUSH KNIGHT - CANVAS
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    const thisMob = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    if (this.state === undefined || this.state === targets.length-1) this.state = 0;
    else this.state += 1;
    const target = targets[this.state];
    target.takeAttack(combatParams);
    if (target.type === "Might") {
        BuffManager.generateBuff('BM903A',thisMob,combatParams.power);
        thisMob.image = '<img src="/assets/images/enemies/B903A.gif">';
        $("#mobImage"+thisMob.uniqueid).html(thisMob.image);
    }
    else if (target.type === "Mind") {
        BuffManager.generateBuff('BM903B',thisMob,combatParams.power);
        thisMob.image = '<img src="/assets/images/enemies/B903B.gif">';
        $("#mobImage"+thisMob.uniqueid).html(thisMob.image);
    }
    else if (target.type === "Moxie") {
        BuffManager.generateBuff('BM903C',thisMob,combatParams.power);
        thisMob.image = '<img src="/assets/images/enemies/B903C.gif">';
        $("#mobImage"+thisMob.uniqueid).html(thisMob.image);
    }
}

SkillManager.skillEffects['SM903B'] = function (combatParams) {
    //PAINTBRUSH KNIGHT - MASTERPIECE
    const thisMob = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    thisMob.image = '<img src="/assets/images/enemies/B903.gif">';
    $("#mobImage"+thisMob.uniqueid).html(thisMob.image);
    if (thisMob.hasBuff("BM903A")) {
        BuffManager.removeBuff("BM903A",thisMob);
        BuffManager.generateBuff("BM903D",thisMob,combatParams.power);
    }
    else if (thisMob.hasBuff("BM903B")) {
        const stacks = thisMob.getBuffStacks("BM903E");
        BuffManager.removeBuff("BM903B",thisMob);
        const healAmt = Math.floor(combatParams.power*(1+stacks*0.1));
        thisMob.heal(healAmt);
        BuffManager.generateBuff("BM903E",thisMob,combatParams.power);
    }
    else if (thisMob.hasBuff("BM903C")) {
        BuffManager.removeBuff("BM903C",thisMob);
        const buffTarget = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES)[0];
        BuffManager.generateBuff("BM903F",buffTarget,combatParams.power);
    }
}

SkillManager.skillEffects['SM904'] = function (combatParams) {
    //DRAIN - LICH
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        combatParams.power = Math.ceil(target.maxHP()*0.02);
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM904A'] = function (combatParams) {
    //BONESPLOSION - DRY BONES
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM904B'] = function (combatParams) {
    //BONE GROWTH - DRY BONES
    const target = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    BuffManager.clearBuffs(target);
    target.healPercent(100);
    target.state = null;
    target.image = '<img src="/assets/images/enemies/B904A.gif">';
    $("#mobImage"+target.uniqueid).html(target.image);
    target.playbook = PlaybookManager.generatePlayBookFromSkills("S0000","S0000","S0000","SM904A");
    refreshSkillUnit(target);
}

SkillManager.skillEffects['SM904C'] = function (combatParams) {
    //lol it does nothing
}

  //--------------------//
 //   PASSIVE SKILLS   //
//--------------------//

SkillManager.skillEffects['SMP902'] = function (type,target) {
    //Rising Phoenix - Phoenix
    if (type !== "onTurn") return;
    if (target.hp > target.maxHP()/4 || target.state !== null) return;
    target.state = "egg";
    target.image = '<img src="/assets/images/enemies/B902A.gif">';
    $("#mobImage"+target.uniqueid).html(target.image);
    target.playbook = PlaybookManager.generatePlayBookFromSkills("SM902A","SM902A","SM902A","SM902B");
    refreshSkillUnit(target);
    BuffManager.generateBuff('BM902A',target,0);
}

SkillManager.skillEffects['SMP904A'] = function (type,target,attack) {
    if (type !== "dead" || target.state !== null) return;
    //BONE DEATH - DRY BONES
    const lichDead = attack.enemies.find(m=>m.id==="B904").dead();
    if (lichDead) return;
    target.state = "bones";
    target.image = '<img src="/assets/images/enemies/B904B.gif">';
    target.hp = 1;
    BuffManager.clearBuffs(target);
    $("#mobImage"+target.uniqueid).html(target.image);
    target.playbook = PlaybookManager.generatePlayBookFromSkills("SM904C","SM904C","SM904C","SM904B");
    refreshSkillUnit(target);
    BuffManager.generateBuff('BM904A',target,0);
}