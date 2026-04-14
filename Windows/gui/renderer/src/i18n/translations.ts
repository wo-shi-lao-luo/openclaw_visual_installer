export type Locale = 'en' | 'zh';

export const translations = {
  en: {
    // Start screen
    start_desc:   'Install OpenClaw on your Windows machine.\nNode.js setup and configuration handled automatically.',
    start_button: 'Install OpenClaw',

    // Step labels (keyed by step id)
    step_environment_check: 'Environment',
    step_validate:          'Validate',
    step_install:           'Install',
    step_verify:            'Verify',
    step_finalize:          'Finalize',

    // Result
    result_success:    'OpenClaw installed successfully',
    result_cli:        'CLI:',
    result_hint:       'Open a new PowerShell window and run',
    result_failed:     'Installation failed',
    result_cancelled:  'Installation was cancelled.',
    result_retry:      'Try again',

    // Confirm modal
    modal_confirm: 'Confirm',
    modal_cancel:  'Cancel',

    // Stream / status
    stream_waiting:                  'Preparing…',
    stream_step_environment_check:   'Checking environment…',
    stream_step_validate:            'Validating setup…',
    stream_step_install:             'Installing OpenClaw…',
    stream_step_verify:              'Verifying installation…',
    stream_step_finalize:            'Finalizing…',
  },

  zh: {
    start_desc:   '在您的 Windows 电脑上安装 OpenClaw。\nNode.js 配置与安装将全程自动完成。',
    start_button: '安装 OpenClaw',

    step_environment_check: '环境检测',
    step_validate:          '验证',
    step_install:           '安装',
    step_verify:            '确认',
    step_finalize:          '完成',

    result_success:    'OpenClaw 安装成功',
    result_cli:        'CLI 路径：',
    result_hint:       '打开新的 PowerShell 窗口运行',
    result_failed:     '安装失败',
    result_cancelled:  '安装已取消。',
    result_retry:      '重试',

    modal_confirm: '确认',
    modal_cancel:  '取消',

    stream_waiting:                  '准备中…',
    stream_step_environment_check:   '正在检测系统环境…',
    stream_step_validate:            '正在验证配置…',
    stream_step_install:             '正在安装 OpenClaw…',
    stream_step_verify:              '正在确认安装结果…',
    stream_step_finalize:            '正在完成安装…',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof typeof translations.en;

// Map step ids → stream progress translation keys
export const STEP_STREAM_KEYS: Record<string, TranslationKey> = {
  'environment-check': 'stream_step_environment_check',
  'validate':          'stream_step_validate',
  'install':           'stream_step_install',
  'verify':            'stream_step_verify',
  'finalize':          'stream_step_finalize',
};

// Map step ids → label translation keys
export const STEP_LABEL_KEYS: Record<string, TranslationKey> = {
  'environment-check': 'step_environment_check',
  'validate':          'step_validate',
  'install':           'step_install',
  'verify':            'step_verify',
  'finalize':          'step_finalize',
};
