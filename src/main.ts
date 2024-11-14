import { App, Editor, TFile, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { ClassRelationView, VIEW_TYPE_CRV } from './ClassRelationView';

// Remember to rename these classes and interfaces!

interface CRVPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: CRVPluginSettings = {
	mySetting: 'default'
}

export default class ClassRelationVisualizationPlugin extends Plugin {
	settings: CRVPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_CRV,
			(leaf) => new ClassRelationView(leaf)
		);

		this.addCommand({
			id: 'open-class-relation-view',
			name: 'Open Class Relation View',
			callback: () => {
				this.activateView();
			}
		})
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const leaf = this.app.workspace.getLeaf(true);
		await leaf.setViewState({ type: VIEW_TYPE_CRV });
		this.app.workspace.revealLeaf(leaf);
	}
}