<template>
  <div class="login-page">
    <!-- 左侧品牌展示区 -->
    <div class="login-brand">
      <div class="brand-bg">
        <div class="bg-shape shape-1" />
        <div class="bg-shape shape-2" />
        <div class="bg-grid" />
      </div>

      <!-- 无人机插画背景（原创 SVG） -->
      <div class="brand-illustration">
        <DroneIllustration color="#2d8cf0" accent="#5cadff" />
      </div>

      <div class="brand-content">
        <div class="brand-header">
          <div class="brand-logo">
            <img :src="droneIcon" class="brand-logo-icon" />
          </div>
          <div class="brand-name">云端机队管理平台</div>
        </div>
        <div class="brand-hero">
          <h2 class="brand-title">
            智能机队<br />一站式管控
          </h2>
          <p class="brand-desc">
            集设备管理、实时监控、任务调度于一体的<br />
            企业级无人机云端控制平台
          </p>
        </div>
        <div class="brand-features">
          <div class="feature-item">
            <div class="feature-icon">
              <ThunderboltOutlined />
            </div>
            <div class="feature-text">
              <div class="feature-title">实时监控</div>
              <div class="feature-desc">毫秒级遥测数据 全方位掌握飞行状态</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <ClusterOutlined />
            </div>
            <div class="feature-text">
              <div class="feature-title">机队管理</div>
              <div class="feature-desc">多设备统一接入 集中调度高效协同</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <SafetyCertificateOutlined />
            </div>
            <div class="feature-text">
              <div class="feature-title">安全可靠</div>
              <div class="feature-desc">企业级权限控制 数据加密全程防护</div>
            </div>
          </div>
        </div>
        <div class="brand-footer">
          Copyright © {{ new Date().getFullYear() }} Drone Fleet Manager. All Rights Reserved.
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区 -->
    <div class="login-form-wrap">
      <div class="login-card">
        <div class="card-header">
          <h1 class="card-title">欢迎登录</h1>
          <p class="card-subtitle">请输入您的账号信息以继续访问</p>
        </div>
        <a-form
          :model="formState"
          class="login-form"
          @submit.prevent="onSubmit"
        >
          <a-form-item>
            <a-input
              v-model:value="formState.username"
              size="large"
              placeholder="请输入用户名"
              autocomplete="username"
              class="form-input"
              @pressEnter="onSubmit"
            >
              <template #prefix>
                <UserOutlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input-password
              v-model:value="formState.password"
              size="large"
              placeholder="请输入密码"
              autocomplete="current-password"
              class="form-input"
              @pressEnter="onSubmit"
            >
              <template #prefix>
                <LockOutlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>
          <div class="form-extra">
            <a-checkbox v-model:checked="rememberMe">记住账号</a-checkbox>
            <span class="form-tip">仅记住用户名，不保存密码</span>
          </div>
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :disabled="loginBtnDisabled"
              :loading="loggingIn"
              class="login-btn"
            >
              {{ loggingIn ? '登录中...' : '登 录' }}
            </a-button>
          </a-form-item>
        </a-form>
        <div class="card-footer">
          <span>登录即表示您同意</span>
          <a class="link" href="javascript:;">《服务协议》</a>
          <span>与</span>
          <a class="link" href="javascript:;">《隐私政策》</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import droneIcon from '/@/assets/icons/drone.png'
import DroneIllustration from '/@/components/common/drone-illustration.vue'
import {
  LockOutlined,
  UserOutlined,
  ThunderboltOutlined,
  ClusterOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { reactive, computed, UnwrapRef, ref, onMounted } from 'vue'
import { login, LoginBody } from '/@/api/manage'
import { getRoot } from '/@/root'
import { ELocalStorageKey, ERouterName, EUserType } from '/@/types'

const root = getRoot()

const REMEMBER_KEY = 'web_login_remember_username'

const formState: UnwrapRef<LoginBody> = reactive({
  username: '',
  password: '',
  flag: EUserType.Web,
})

const rememberMe = ref<boolean>(false)
const loggingIn = ref<boolean>(false)

const loginBtnDisabled = computed(() => {
  return !formState.username || !formState.password
})

onMounted(() => {
  const saved = localStorage.getItem(REMEMBER_KEY)
  if (saved) {
    formState.username = saved
    rememberMe.value = true
  }
})

const onSubmit = async () => {
  if (loginBtnDisabled.value || loggingIn.value) {
    return
  }
  loggingIn.value = true
  try {
    const result = await login(formState)
    if (result.code === 0) {
      if (rememberMe.value) {
        localStorage.setItem(REMEMBER_KEY, formState.username)
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
      localStorage.setItem(ELocalStorageKey.Token, result.data.access_token)
      localStorage.setItem(ELocalStorageKey.WorkspaceId, result.data.workspace_id)
      localStorage.setItem(ELocalStorageKey.Username, result.data.username)
      localStorage.setItem(ELocalStorageKey.UserId, result.data.user_id)
      localStorage.setItem(ELocalStorageKey.Flag, EUserType.Web.toString())
      message.success('登录成功')
      root.$router.push(ERouterName.MEMBERS)
    } else {
      message.error(result.message || '登录失败，请检查用户名或密码')
    }
  } catch (err: any) {
    message.error(err?.message || '登录异常，请稍后重试')
  } finally {
    loggingIn.value = false
  }
}
</script>

<style lang="scss" scoped>
$primary: #2d8cf0;
$primary-dark: #1a6dd4;

.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: #f5f7fb;
}

/* ============ 左侧品牌区 ============ */
.login-brand {
  flex: 1.1;
  position: relative;
  background: linear-gradient(135deg, #0f1419 0%, #142b46 50%, #0d1b2a 100%);
  color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.brand-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .bg-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(2px);
  }

  .shape-1 {
    width: 540px;
    height: 540px;
    background: radial-gradient(circle, rgba(45, 140, 240, 0.28) 0%, transparent 70%);
    top: -220px;
    right: -180px;
    animation: float 9s ease-in-out infinite;
  }

  .shape-2 {
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(92, 173, 255, 0.18) 0%, transparent 70%);
    bottom: -140px;
    left: -120px;
    animation: float 11s ease-in-out infinite reverse;
  }

  .bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
  }
}

/* 无人机插画 - 作为左侧水印背景 */
.brand-illustration {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
  opacity: 0.35;
  pointer-events: none;

  :deep(svg) {
    width: min(620px, 90%);
    height: auto;
    aspect-ratio: 1 / 1;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

.brand-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 48px 64px;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(45, 140, 240, 0.4);

  .brand-logo-icon {
    width: 26px;
    height: 26px;
    filter: brightness(0) invert(1);
  }
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.brand-hero {
  margin-top: auto;
  padding-top: 60px;
}

.brand-title {
  font-size: 44px;
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 20px;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #ffffff 0%, #b8d6ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-desc {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
}

.brand-features {
  margin-top: 56px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(45, 140, 240, 0.4);
    transform: translateX(4px);
  }
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(45, 140, 240, 0.25) 0%, rgba(45, 140, 240, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5cadff;
  font-size: 18px;
  flex-shrink: 0;
}

.feature-text {
  .feature-title {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 2px;
  }

  .feature-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
  }
}

.brand-footer {
  margin-top: auto;
  padding-top: 40px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

/* ============ 右侧表单区 ============ */
.login-form-wrap {
  flex: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #ffffff;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.card-header {
  margin-bottom: 36px;
}

.card-title {
  font-size: 28px;
  font-weight: 700;
  color: #17233d;
  margin: 0 0 10px;
  letter-spacing: 0.5px;
}

.card-subtitle {
  font-size: 14px;
  color: #808695;
  margin: 0;
}

.login-form {
  .form-input {
    :deep(.ant-input-prefix) {
      margin-right: 10px;
    }

    :deep(.ant-input-affix-wrapper),
    :deep(.ant-input) {
      border-radius: 10px;
    }

    :deep(.ant-input-affix-wrapper) {
      padding: 8px 12px;
    }
  }

  .input-icon {
    color: #b0b6c0;
    font-size: 16px;
  }
}

.form-extra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -8px 0 18px;

  .form-tip {
    font-size: 12px;
    color: #b0b6c0;
  }
}

.login-btn {
  width: 100%;
  height: 46px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  border: none;
  box-shadow: 0 6px 18px rgba(45, 140, 240, 0.35);
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    box-shadow: 0 8px 24px rgba(45, 140, 240, 0.5);
    transform: translateY(-1px);
  }

  &:disabled {
    background: linear-gradient(135deg, #c7dcf2 0%, #b3cce8 100%);
    box-shadow: none;
    transform: none;
    color: #fff;
  }
}

.card-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: #b0b6c0;

  .link {
    color: $primary;
    margin: 0 2px;

    &:hover {
      color: $primary-dark;
      text-decoration: underline;
    }
  }
}

/* ============ 响应式 ============ */
@media (max-width: 960px) {
  .login-brand {
    display: none;
  }

  .login-form-wrap {
    flex: 1;
    background: linear-gradient(135deg, #f5f7fb 0%, #e8eef7 100%);
  }

  .login-card {
    background: #fff;
    padding: 40px 32px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  }
}

@media (max-width: 480px) {
  .login-form-wrap {
    padding: 16px;
  }

  .login-card {
    padding: 32px 24px;
  }

  .card-title {
    font-size: 24px;
  }
}
</style>
