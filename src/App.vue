<template>
	<div id="app">
		<header class="header">
			<h1>Git Credential Manager</h1>
			<p>Git 글로벌 설정 관리 및 GitHub 자격 증명 자동 삭제</p>
		</header>

		<main class="main">
			<div class="card">
				<h2>현재 Git 설정</h2>
				<div v-if="loading" class="loading">
					<div class="spinner"></div>
					<p>설정을 불러오는 중...</p>
				</div>

				<div v-else-if="error" class="error">
					<p>{{ error }}</p>
					<button @click="loadGitConfig" class="btn btn-primary">
						다시 시도
					</button>
				</div>

				<div v-else class="current-config">
					<div class="config-item">
						<label>이름:</label>
						<span>{{ gitConfig.name || '설정되지 않음' }}</span>
					</div>
					<div class="config-item">
						<label>이메일:</label>
						<span>{{ gitConfig.email || '설정되지 않음' }}</span>
					</div>
				</div>
			</div>

			<div class="card">
				<h2>저장된 계정 목록</h2>
				<div v-if="accountsLoading" class="loading">
					<div class="spinner"></div>
					<p>계정 목록을 불러오는 중...</p>
				</div>

				<div v-else-if="savedAccounts.length === 0" class="empty-state">
					<p>저장된 계정이 없습니다.</p>
					<p>
						메뉴에서 "파일 > 새 계정 추가"를 선택하거나 Ctrl+N을
						눌러주세요.
					</p>
				</div>

				<div v-else class="accounts-list">
					<div
						v-for="account in savedAccounts"
						:key="account.id"
						class="account-item"
						:class="{ active: isCurrentAccount(account) }"
					>
						<div class="account-info">
							<div class="account-name">{{ account.name }}</div>
							<div class="account-email">{{ account.email }}</div>
						</div>
						<div class="account-actions">
							<button
								@click="switchToAccount(account)"
								class="btn btn-primary btn-sm"
								:disabled="isCurrentAccount(account)"
							>
								{{
									isCurrentAccount(account) ? '현재' : '적용'
								}}
							</button>
							<button
								@click="deleteAccount(account.id)"
								class="btn btn-danger btn-sm"
							>
								삭제
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- 새 계정 추가 모달 -->
			<div v-if="showAddModal" class="modal-overlay" @click="closeModal">
				<div class="modal" @click.stop>
					<div class="modal-header">
						<h3>새 계정 추가</h3>
						<button @click="closeModal" class="btn-close">×</button>
					</div>
					<form
						@submit.prevent="saveNewAccount"
						class="modal-content"
					>
						<div class="form-group">
							<label for="modal-name">이름 *</label>
							<input
								id="modal-name"
								v-model="newAccount.name"
								type="text"
								placeholder="Git 사용자 이름"
								required
								class="form-input"
								ref="nameInput"
							/>
						</div>

						<div class="form-group">
							<label for="modal-email">이메일 *</label>
							<input
								id="modal-email"
								v-model="newAccount.email"
								type="email"
								placeholder="Git 사용자 이메일"
								required
								class="form-input"
							/>
						</div>

						<div class="modal-actions">
							<button
								type="submit"
								class="btn btn-primary"
								:disabled="saving"
							>
								{{ saving ? '저장 중...' : '계정 추가' }}
							</button>
							<button
								type="button"
								@click="closeModal"
								class="btn btn-secondary"
							>
								취소
							</button>
						</div>
					</form>
				</div>
			</div>

			<!-- 토스트 알림 -->
			<div v-if="message" class="message" :class="messageType">
				<p>{{ message }}</p>
				<button @click="clearMessage" class="btn-close">×</button>
			</div>
		</main>

		<footer class="footer">
			<p>계정 적용 시 GitHub 자격 증명이 자동으로 삭제됩니다.</p>
		</footer>
	</div>
</template>

<script setup lang="ts">
/**
 * Git Credential Manager - Vue 3 메인 컴포넌트
 *
 * 주요 기능:
 * - 현재 Git 글로벌 설정 표시
 * - 저장된 계정 목록 관리
 * - 새 계정 추가 (모달)
 * - 계정 전환 및 삭제
 * - 토스트 알림 시스템
 */

import { ref, onMounted, reactive, nextTick } from 'vue';

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

interface NewAccount {
	name: string;
	email: string;
}

// 반응형 데이터
const loading = ref(false);
const accountsLoading = ref(false);
const saving = ref(false);
const error = ref('');
const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const showAddModal = ref(false);
const messageTimeout = ref<number | null>(null);
const gitConfig = reactive<GitConfig>({ name: '', email: '' });
const newAccount = reactive<NewAccount>({ name: '', email: '' });
const savedAccounts = ref<SavedAccount[]>([]);
const nameInput = ref<HTMLInputElement | null>(null);

// Git 설정 로드
const loadGitConfig = async () => {
	loading.value = true;
	error.value = '';

	try {
		const result = await window.electronAPI.getGitConfig();

		if (result.success && result.data) {
			gitConfig.name = result.data.name;
			gitConfig.email = result.data.email;
		} else {
			error.value = result.error || '설정을 불러올 수 없습니다.';
		}
	} catch (err) {
		error.value = '설정을 불러오는 중 오류가 발생했습니다.';
	} finally {
		loading.value = false;
	}
};

// 계정 목록 로드
const loadAccounts = async () => {
	accountsLoading.value = true;

	try {
		const result = await window.electronAPI.getAccountList();

		if (result.success && result.accounts) {
			savedAccounts.value = result.accounts;
		}
	} catch (err) {
		console.error('계정 목록 로드 실패:', err);
	} finally {
		accountsLoading.value = false;
	}
};

// 새 계정 저장
const saveNewAccount = async () => {
	if (!newAccount.name.trim() || !newAccount.email.trim()) {
		showMessage('이름과 이메일을 모두 입력해주세요.', 'error');
		return;
	}

	saving.value = true;

	try {
		const result = await window.electronAPI.saveAccount(
			newAccount.name.trim(),
			newAccount.email.trim()
		);

		if (result.success) {
			showMessage(result.message, 'success');
			closeModal();
			await loadAccounts(); // 계정 목록 다시 로드
		} else {
			showMessage(result.message, 'error');
		}
	} catch (err) {
		showMessage('계정 저장 중 오류가 발생했습니다.', 'error');
	} finally {
		saving.value = false;
	}
};

// 계정 적용
const switchToAccount = async (account: SavedAccount) => {
	try {
		const result = await window.electronAPI.updateGitConfig(
			account.name,
			account.email
		);

		if (result.success) {
			showMessage(
				`계정이 ${account.name}으로 적용되었습니다.`,
				'success'
			);
			await loadGitConfig(); // 설정 다시 로드
		} else {
			showMessage(result.message, 'error');
		}
	} catch (err) {
		showMessage('계정 적용 중 오류가 발생했습니다.', 'error');
	}
};

// 계정 삭제
const deleteAccount = async (id: string) => {
	if (!confirm('정말로 이 계정을 삭제하시겠습니까?')) {
		return;
	}

	try {
		const result = await window.electronAPI.deleteAccount(id);

		if (result.success) {
			showMessage(result.message, 'success');
			await loadAccounts(); // 계정 목록 다시 로드
			// 입력 필드 초기화
			await resetNewAccountForm();
		} else {
			showMessage(result.message, 'error');
		}
	} catch (err) {
		showMessage('계정 삭제 중 오류가 발생했습니다.', 'error');
	}
};

// 현재 계정인지 확인
const isCurrentAccount = (account: SavedAccount): boolean => {
	return account.name === gitConfig.name && account.email === gitConfig.email;
};

// 모달 열기
const openModal = () => {
	showAddModal.value = true;
	resetNewAccountForm();
	// 모달이 열린 후 이름 입력 필드에 포커스
	nextTick(() => {
		if (nameInput.value) {
			nameInput.value.focus();
		}
	});
};

// 모달 닫기
const closeModal = () => {
	showAddModal.value = false;
	resetNewAccountForm();
};

// 새 계정 폼 초기화
const resetNewAccountForm = async () => {
	newAccount.name = '';
	newAccount.email = '';
	// DOM 업데이트를 기다린 후 입력 필드에 포커스
	await nextTick();
};

// 메시지 표시
const showMessage = (msg: string, type: 'success' | 'error') => {
	// 기존 타이머가 있다면 제거
	if (messageTimeout.value) {
		clearTimeout(messageTimeout.value);
	}

	message.value = msg;
	messageType.value = type;

	// 3초 후 자동으로 메시지 제거
	messageTimeout.value = window.setTimeout(() => {
		clearMessage();
	}, 3000);
};

// 메시지 제거
const clearMessage = () => {
	message.value = '';
	if (messageTimeout.value) {
		clearTimeout(messageTimeout.value);
		messageTimeout.value = null;
	}
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
	loadGitConfig();
	loadAccounts();

	// 메뉴에서 새 계정 추가 모달 열기 이벤트 리스너
	window.electronAPI.onOpenAddAccountModal(() => {
		openModal();
	});
});
</script>

<style scoped>
#app {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI',
		Roboto, sans-serif;
}

.header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	padding: 1.5rem;
	text-align: center;
}

.header h1 {
	margin: 0 0 0.25rem 0;
	font-size: 1.75rem;
	font-weight: 700;
}

.header p {
	margin: 0;
	opacity: 0.9;
	font-size: 0.9rem;
}

.main {
	flex: 1;
	padding: 1.5rem;
	max-width: 700px;
	margin: 0 auto;
	width: 100%;
}

.card {
	background: white;
	border-radius: 8px;
	padding: 1.25rem;
	margin-bottom: 1.5rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	border: 1px solid #e5e7eb;
}

.card h2 {
	margin: 0 0 1rem 0;
	color: #1f2937;
	font-size: 1.25rem;
	font-weight: 600;
}

.loading {
	text-align: center;
	padding: 1.5rem;
}

.spinner {
	width: 24px;
	height: 24px;
	border: 3px solid #f3f4f6;
	border-top: 3px solid #667eea;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto 0.5rem;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

.error {
	color: #dc2626;
	text-align: center;
	padding: 0.75rem;
	background: #fef2f2;
	border-radius: 6px;
	border: 1px solid #fecaca;
	font-size: 0.875rem;
}

.empty-state {
	text-align: center;
	padding: 1.5rem;
	color: #6b7280;
	font-size: 0.875rem;
}

.current-config {
	display: grid;
	gap: 0.75rem;
}

.config-item {
	display: flex;
	align-items: center;
	padding: 0.75rem;
	background: #f9fafb;
	border-radius: 6px;
	border: 1px solid #e5e7eb;
}

.config-item label {
	font-weight: 600;
	color: #374151;
	min-width: 60px;
	margin-right: 0.75rem;
	font-size: 0.875rem;
}

.config-item span {
	color: #1f2937;
	font-size: 0.875rem;
	font-weight: 600;
}

.accounts-list {
	display: grid;
	gap: 0.75rem;
}

.account-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem;
	background: #f9fafb;
	border-radius: 6px;
	border: 1px solid #e5e7eb;
	transition: all 0.2s;
}

.account-item:hover {
	background: #f3f4f6;
}

.account-item.active {
	background: #dbeafe;
	border-color: #3b82f6;
}

.account-info {
	flex: 1;
}

.account-name {
	font-weight: 600;
	color: #1f2937;
	margin-bottom: 0.125rem;
	font-size: 0.875rem;
}

.account-email {
	color: #6b7280;
	font-size: 0.8rem;
}

.account-actions {
	display: flex;
	gap: 0.5rem;
}

.config-form {
	display: grid;
	gap: 1rem;
}

.form-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
}

.form-group {
	display: grid;
	gap: 0.375rem;
}

.form-group label {
	font-weight: 600;
	color: #374151;
	font-size: 0.875rem;
}

.form-input {
	padding: 0.5rem 0.75rem;
	border: 2px solid #e5e7eb;
	border-radius: 6px;
	font-size: 0.875rem;
	transition: border-color 0.2s;
}

.form-input:focus {
	outline: none;
	border-color: #667eea;
	box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.form-actions {
	display: flex;
	gap: 0.75rem;
	margin-top: 0.5rem;
}

.btn {
	padding: 0.5rem 1rem;
	border: none;
	border-radius: 6px;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
	min-width: 80px;
}

.btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.btn-primary {
	background: #667eea;
	color: white;
}

.btn-primary:hover:not(:disabled) {
	background: #5a67d8;
	transform: translateY(-1px);
}

.btn-secondary {
	background: #f3f4f6;
	color: #374151;
	border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
	background: #e5e7eb;
}

.btn-danger {
	background: #ef4444;
	color: white;
}

.btn-danger:hover:not(:disabled) {
	background: #dc2626;
	transform: translateY(-1px);
}

.btn-sm {
	padding: 0.375rem 0.75rem;
	font-size: 0.8rem;
	min-width: 60px;
}

.message {
	position: fixed;
	top: 1.5rem;
	right: 1.5rem;
	padding: 0.75rem 1rem;
	border-radius: 6px;
	color: white;
	font-weight: 500;
	display: flex;
	align-items: center;
	gap: 0.75rem;
	max-width: 350px;
	z-index: 1000;
	animation: slideIn 0.3s ease-out;
	font-size: 0.875rem;
}

.message.success {
	background: #10b981;
}

.message.error {
	background: #ef4444;
}

.btn-close {
	background: none;
	border: none;
	color: white;
	font-size: 1.25rem;
	cursor: pointer;
	padding: 0;
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	transition: background-color 0.2s;
}

.btn-close:hover {
	background: rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
	from {
		transform: translateX(100%);
		opacity: 0;
	}
	to {
		transform: translateX(0);
		opacity: 1;
	}
}

.footer {
	background: #f9fafb;
	padding: 1rem;
	text-align: center;
	color: #6b7280;
	border-top: 1px solid #e5e7eb;
	font-size: 0.8rem;
}

@media (max-width: 768px) {
	.header {
		padding: 1rem;
	}

	.header h1 {
		font-size: 1.5rem;
	}

	.main {
		padding: 1rem;
	}

	.card {
		padding: 1rem;
	}

	.form-row {
		grid-template-columns: 1fr;
	}

	.form-actions {
		flex-direction: column;
	}

	.account-item {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.account-actions {
		width: 100%;
		justify-content: flex-end;
	}

	.message {
		top: 1rem;
		right: 1rem;
		left: 1rem;
		max-width: none;
	}

	.modal {
		width: 90%;
		max-width: 400px;
	}
}

/* 모달 스타일 */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	animation: fadeIn 0.2s ease-out;
}

.modal {
	background: white;
	border-radius: 8px;
	width: 100%;
	max-width: 450px;
	margin: 1rem;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
	animation: slideUp 0.3s ease-out;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.25rem 1.25rem 0;
}

.modal-header h3 {
	margin: 0;
	color: #1f2937;
	font-size: 1.25rem;
	font-weight: 600;
}

.modal-content {
	padding: 1.25rem;
}

.modal-actions {
	display: flex;
	gap: 0.75rem;
	margin-top: 1.5rem;
	justify-content: flex-end;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes slideUp {
	from {
		transform: translateY(20px);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}
</style>
