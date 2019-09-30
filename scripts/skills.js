"use strict";

const SkillManager = {
    skills : [],
    addSkill(skill) {
        this.skills.push(skill);
    },
    idToSkill(id) {
        return this.skills.find(skill => skill.id === id);
    }
}

const PlaybookManager = {
    playbookDB : [],
    addPlaybookTemplate(pb) {
        this.playbooks.push(pb);
    },
    idToPlaybook(id) {
        return this.playbooks.find(playbook => playbook.id === id);
    },
    generatePlayBook(playbookID) {
        const playbookTemplate = this.idToPlaybook(playbookID);
        return new Playbook(playbookTemplate);
    }
}

class playBookTemplate {
    constructor (props) {
        Object.assign(this, props);
        this.position = 0;
    }
}

class Skill {
    constructor (props) {
        Object.assign(this, props);
    }
}

class Playbook {
    constructor (pbTemplate) {
        Object.assign(this, pbTemplate);
        this.position = 0;
    }
    reset() {
        this.position = 0;
    }
}