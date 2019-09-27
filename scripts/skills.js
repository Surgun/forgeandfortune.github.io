"use strict";

const SkillManager = {
    skills = [],
    addMob(skill) {
        this.skills.push(skill);
    },
    idToSkill(id) {
        return this.skills.find(skill => skill.id === id);
    }
}

class Skill {
    constructor (props) {
        Object.assign(this, props);
    }
}