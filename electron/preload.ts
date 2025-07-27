import { contextBridge, ipcRenderer } from 'electron';

// API 타입 정의
interface GitConfig {
	name: string;
	email: string;
}

interface SavedAccount {
	id: string;
	name: string;
	email: string;
	createdAt: string;
}

interface GitConfigResult {
	success: boolean;
	data?: GitConfig;
	error?: string;
}

interface UpdateConfigResult {
	success: boolean;
	message: string;
}

interface AccountListResult {
	success: boolean;
	accounts?: SavedAccount[];
	error?: string;
}

interface SaveAccountResult {
	success: boolean;
	message: string;
}

interface DeleteAccountResult {
	success: boolean;
	message: string;
}

// 렌더러 프로세스에서 사용할 API 노출
contextBridge.exposeInMainWorld('electronAPI', {
	getGitConfig: (): Promise<GitConfigResult> =>
		ipcRenderer.invoke('get-git-config'),
	updateGitConfig: (
		name: string,
		email: string
	): Promise<UpdateConfigResult> =>
		ipcRenderer.invoke('update-git-config', name, email),
	getAccountList: (): Promise<AccountListResult> =>
		ipcRenderer.invoke('get-account-list'),
	saveAccount: (name: string, email: string): Promise<SaveAccountResult> =>
		ipcRenderer.invoke('save-account', name, email),
	deleteAccount: (id: string): Promise<DeleteAccountResult> =>
		ipcRenderer.invoke('delete-account', id),
	onOpenAddAccountModal: (callback: () => void) =>
		ipcRenderer.on('open-add-account-modal', callback),
});

// 전역 타입 선언
declare global {
	interface Window {
		electronAPI: {
			getGitConfig: () => Promise<GitConfigResult>;
			updateGitConfig: (
				name: string,
				email: string
			) => Promise<UpdateConfigResult>;
			getAccountList: () => Promise<AccountListResult>;
			saveAccount: (
				name: string,
				email: string
			) => Promise<SaveAccountResult>;
			deleteAccount: (id: string) => Promise<DeleteAccountResult>;
			onOpenAddAccountModal: (callback: () => void) => void;
		};
	}
}
