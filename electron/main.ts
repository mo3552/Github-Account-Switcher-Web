/**
 * Git Credential Manager - Electron Main Process
 *
 * 주요 기능:
 * - Git 글로벌 설정 조회/변경
 * - Windows 자격 증명 관리자에서 GitHub 자격 증명 삭제
 * - 계정 목록 저장/관리
 * - IPC 통신을 통한 렌더러 프로세스와의 통신
 */

import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

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

let mainWindow: BrowserWindow | null = null;

// 계정 저장소 파일 경로 (사용자 데이터 폴더에 JSON 파일로 저장)
const accountsFilePath = path.join(app.getPath('userData'), 'accounts.json');

// 계정 목록 로드
async function loadAccounts(): Promise<SavedAccount[]> {
	try {
		const fs = require('fs');
		if (fs.existsSync(accountsFilePath)) {
			const data = fs.readFileSync(accountsFilePath, 'utf8');
			return JSON.parse(data);
		}
	} catch (error) {
		console.error('계정 목록 로드 실패:', error);
	}
	return [];
}

// 계정 목록 저장
async function saveAccounts(accounts: SavedAccount[]): Promise<void> {
	try {
		const fs = require('fs');
		fs.writeFileSync(accountsFilePath, JSON.stringify(accounts, null, 2));
	} catch (error) {
		console.error('계정 목록 저장 실패:', error);
	}
}

// 계정 목록 조회
async function getAccountList(): Promise<AccountListResult> {
	try {
		const accounts = await loadAccounts();
		return {
			success: true,
			accounts,
		};
	} catch (error) {
		return {
			success: false,
			error: '계정 목록을 불러올 수 없습니다.',
		};
	}
}

// 계정 저장
async function saveAccount(
	name: string,
	email: string
): Promise<SaveAccountResult> {
	try {
		if (!name.trim() || !email.trim()) {
			return {
				success: false,
				message: '이름과 이메일을 모두 입력해주세요.',
			};
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return {
				success: false,
				message: '올바른 이메일 형식을 입력해주세요.',
			};
		}

		const accounts = await loadAccounts();
		const newAccount: SavedAccount = {
			id: Date.now().toString(),
			name: name.trim(),
			email: email.trim(),
			createdAt: new Date().toISOString(),
		};

		// 중복 체크 (이메일만 체크)
		const isDuplicate = accounts.some(
			(account) => account.email === newAccount.email
		);

		if (isDuplicate) {
			return {
				success: false,
				message: '이미 존재하는 이메일입니다.',
			};
		}

		accounts.push(newAccount);
		await saveAccounts(accounts);

		return {
			success: true,
			message: '계정이 성공적으로 저장되었습니다.',
		};
	} catch (error) {
		return {
			success: false,
			message: '계정 저장에 실패했습니다.',
		};
	}
}

// 계정 삭제
async function deleteAccount(id: string): Promise<DeleteAccountResult> {
	try {
		const accounts = await loadAccounts();
		const filteredAccounts = accounts.filter(
			(account) => account.id !== id
		);

		if (accounts.length === filteredAccounts.length) {
			return {
				success: false,
				message: '삭제할 계정을 찾을 수 없습니다.',
			};
		}

		await saveAccounts(filteredAccounts);

		return {
			success: true,
			message: '계정이 성공적으로 삭제되었습니다.',
		};
	} catch (error) {
		return {
			success: false,
			message: '계정 삭제에 실패했습니다.',
		};
	}
}

function createMenu() {
	const template: Electron.MenuItemConstructorOptions[] = [
		{
			label: '파일',
			submenu: [
				{
					label: '새 계정 추가',
					accelerator: 'CmdOrCtrl+N',
					click: () => {
						if (mainWindow) {
							mainWindow.webContents.send(
								'open-add-account-modal'
							);
						}
					},
				},
				{ type: 'separator' },
				{
					label: '종료',
					accelerator:
						process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
					click: () => {
						app.quit();
					},
				},
			],
		},
		{
			label: '보기',
			submenu: [
				{
					label: '새로고침',
					role: 'reload',
				},
				{
					label: '강제 새로고침',
					role: 'forceReload',
				},
			],
		},
		{
			label: '도움말',
			submenu: [
				{
					label: '정보',
					click: () => {
						dialog.showMessageBox(mainWindow!, {
							type: 'info',
							title: 'Git Credential Manager',
							message: 'Git Credential Manager',
							detail: `버전: 1.0.0\n제작자: Mario\n이메일: mo3552@gmail.com\n\nGit 글로벌 설정 관리 및 GitHub 자격 증명 자동 삭제 도구입니다.`,
							buttons: ['확인'],
						});
					},
				},
			],
		},
	];

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 800,
		resizable: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js'),
			// 하드웨어 가속 비활성화로 깜빡임 방지
			webSecurity: true,
			allowRunningInsecureContent: false,
		},
		title: 'Git Credential Manager',
		icon: path.join(__dirname, '../public/favicon.ico'),
		backgroundColor: '#f8fafc', // 배경색 미리 설정
		// 윈도우 생성 시 최소화 방지
		minimizable: true,
		maximizable: false,
		fullscreenable: false,
	});

	// 메뉴 생성
	createMenu();

	// 개발 모드인지 확인 (IS_DEV 환경 변수 또는 NODE_ENV)
	const isDev = process.env.IS_DEV || process.env.NODE_ENV === 'development';

	if (isDev) {
		mainWindow.loadURL('http://localhost:5173');
		// 개발자 도구는 필요시에만 수동으로 열도록 주석 처리
		// mainWindow.webContents.openDevTools();
	} else {
		mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
	}

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}

// Git 설정 조회
async function getGitConfig(): Promise<GitConfigResult> {
	try {
		const { stdout } = await execAsync(
			'git config --global --get user.name'
		);
		const { stdout: emailStdout } = await execAsync(
			'git config --global --get user.email'
		);

		const name = stdout.trim();
		const email = emailStdout.trim();

		return {
			success: true,
			data: { name, email },
		};
	} catch (error) {
		return {
			success: false,
			error: 'Git 설정을 조회할 수 없습니다. Git이 설치되어 있는지 확인해주세요.',
		};
	}
}

// Git 설정 업데이트
async function updateGitConfig(
	name: string,
	email: string
): Promise<UpdateConfigResult> {
	try {
		// 입력값 검증
		if (!name.trim() || !email.trim()) {
			return {
				success: false,
				message: '이름과 이메일을 모두 입력해주세요.',
			};
		}

		// 이메일 형식 검증
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return {
				success: false,
				message: '올바른 이메일 형식을 입력해주세요.',
			};
		}

		// Git 설정 업데이트
		await execAsync(`git config --global user.name "${name}"`);
		await execAsync(`git config --global user.email "${email}"`);

		// GitHub 자격 증명 삭제 (크로스 플랫폼)
		try {
			if (process.platform === 'win32') {
				// Windows: cmdkey 사용
				await execAsync('cmdkey /delete:git:https://github.com');
			} else if (process.platform === 'darwin') {
				// macOS: 여러 방법 시도
				try {
					// 1. Git Credential Manager (권장)
					await execAsync(
						'git credential-manager delete https://github.com'
					);
				} catch (error1) {
					try {
						// 2. osxkeychain 사용
						await execAsync('git credential-osxkeychain erase');
					} catch (error2) {
						// 3. 수동으로 Keychain에서 삭제 안내
						console.log(
							'macOS Keychain에서 수동으로 GitHub 자격 증명을 삭제해주세요.'
						);
					}
				}
			} else {
				// Linux: Git Credential Manager 사용
				try {
					await execAsync(
						'git credential-manager delete https://github.com'
					);
				} catch (error) {
					// Linux에서 실패 시 안내
					console.log('Linux에서 자격 증명 삭제에 실패했습니다.');
				}
			}

			return {
				success: true,
				message:
					'Git 설정이 성공적으로 업데이트되었고, GitHub 자격 증명이 삭제되었습니다.',
			};
		} catch (credentialError) {
			return {
				success: true,
				message: 'Git 설정이 업데이트되었습니다. (자격 증명 삭제 실패)',
			};
		}
	} catch (error) {
		return {
			success: false,
			message: 'Git 설정 업데이트에 실패했습니다.',
		};
	}
}

// IPC 핸들러 등록
ipcMain.handle('get-git-config', async (): Promise<GitConfigResult> => {
	return await getGitConfig();
});

ipcMain.handle(
	'update-git-config',
	async (event, name: string, email: string): Promise<UpdateConfigResult> => {
		return await updateGitConfig(name, email);
	}
);

ipcMain.handle('get-account-list', async (): Promise<AccountListResult> => {
	return await getAccountList();
});

ipcMain.handle(
	'save-account',
	async (event, name: string, email: string): Promise<SaveAccountResult> => {
		return await saveAccount(name, email);
	}
);

ipcMain.handle(
	'delete-account',
	async (event, id: string): Promise<DeleteAccountResult> => {
		return await deleteAccount(id);
	}
);

// 단일 인스턴스 체크
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	// 이미 다른 인스턴스가 실행 중인 경우
	app.quit();
} else {
	// 두 번째 인스턴스가 실행되려고 할 때
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		// 이미 실행 중인 윈도우가 있으면 포커스
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.restore();
			}
			mainWindow.focus();
		}
	});

	// 앱 시작 시 하드웨어 가속 비활성화
	app.disableHardwareAcceleration();

	// 앱 이벤트 핸들러
	app.whenReady().then(createWindow);

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
}
