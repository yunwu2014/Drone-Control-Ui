<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-shape shape-1" />
      <div class="bg-shape shape-2" />
      <div class="bg-shape shape-3" />
    </div>
    <div class="login-card">
      <div class="card-header">
        <div class="logo-wrapper">
          <img :src="droneIcon" class="logo-icon" />
        </div>
        <h1 class="app-title">Pilot Console</h1>
        <p class="app-subtitle">Drone Mission Control Platform</p>
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
            placeholder="Username"
            class="form-input"
          >
            <template #prefix>
              <UserOutlined class="input-icon" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input
            v-model:value="formState.password"
            type="password"
            size="large"
            placeholder="Password"
            class="form-input"
          >
            <template #prefix>
              <LockOutlined class="input-icon" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :disabled="loginBtnDisabled"
            class="login-btn"
          >
            Log In
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import droneIcon from '/@/assets/icons/drone.png'
import { message } from 'ant-design-vue'
import { onMounted, reactive, computed, UnwrapRef, ref } from 'vue'
import { CURRENT_CONFIG } from '/@/api/http/config'
import { login, LoginBody, refreshToken } from '/@/api/manage'
import apiPilot from '/@/api/pilot-bridge'
import { getRoot } from '/@/root'
import router from '/@/router'
import { EComponentName, ELocalStorageKey, ERouterName, EUserType } from '/@/types'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

const root = getRoot()

const formState: UnwrapRef<LoginBody> = reactive({
  username: 'pilot',
  password: 'pilot123',
  flag: EUserType.Pilot,
})

const isVerified = ref<boolean>(false)

const loginBtnDisabled = computed(() => {
  return !formState.username || !formState.password
})

onMounted(async () => {
  verifyLicense()
  if (!isVerified.value) {
    return
  }

  apiPilot.setPlatformMessage('Cloud Api Platform', '', '')

  const token = localStorage.getItem(ELocalStorageKey.Token)
  if (token) {
    await refreshToken({})
      .then(res => {
        apiPilot.setComponentParam(EComponentName.Api, {
          host: CURRENT_CONFIG.baseURL,
          token: res.data.access_token
        })
        const jsres = apiPilot.loadComponent(EComponentName.Api, apiPilot.getComponentParam(EComponentName.Api))
        if (!jsres) {
          message.error('Failed to load api module.')
          return
        }
        apiPilot.setToken(res.data.access_token)
        localStorage.setItem(ELocalStorageKey.Token, res.data.access_token)
        root.$router.push(ERouterName.PILOT_HOME)
      })
      .catch(err => {
        message.error(err)
      })
  }
})

const onSubmit = async (e: any) => {
  await login(formState)
    .then(res => {
      if (!isVerified.value) {
        message.error('Please verify the license firstly.')
        return
      }
      console.log('login res:', res)
      if (res.code === 0) {
        apiPilot.setComponentParam(EComponentName.Api, {
          host: CURRENT_CONFIG.baseURL,
          token: res.data.access_token
        })
        const jsres = apiPilot.loadComponent(
          EComponentName.Api,
          apiPilot.getComponentParam(EComponentName.Api)
        )
        console.log('load api module res:', jsres)
        apiPilot.setToken(res.data.access_token)
        localStorage.setItem(ELocalStorageKey.Token, res.data.access_token)
        localStorage.setItem(ELocalStorageKey.WorkspaceId, res.data.workspace_id)
        localStorage.setItem(ELocalStorageKey.UserId, res.data.user_id)
        localStorage.setItem(ELocalStorageKey.Username, res.data.username)
        localStorage.setItem(ELocalStorageKey.Flag, EUserType.Pilot.toString())
        message.success('Login Success')
        root.$router.push(ERouterName.PILOT_HOME)
      }
    })
    .catch(err => {
      message.error(err)
    })
}

function verifyLicense () {
  isVerified.value = apiPilot.platformVerifyLicense(CURRENT_CONFIG.appId, CURRENT_CONFIG.appKey, CURRENT_CONFIG.appLicense) &&
    apiPilot.isPlatformVerifySuccess()
  if (isVerified.value) {
    message.success('The license verification is successful.')
  } else {
    message.error('Filed to verify the license. Please check license whether the license is correct, or apply again.')
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 40%, #0d1b2a 100%);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .bg-shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.08;
  }

  .shape-1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, #2d8cf0 0%, transparent 70%);
    top: -200px;
    right: -150px;
    animation: float 8s ease-in-out infinite;
  }

  .shape-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, #19be6b 0%, transparent 70%);
    bottom: -100px;
    left: -100px;
    animation: float 10s ease-in-out infinite reverse;
  }

  .shape-3 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, #5cadff 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 6s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.08; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.04; }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 48px 40px 40px;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  backdrop-filter: blur(10px);
}

.card-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-wrapper {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #19be6b 0%, #0e9e55 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(25, 190, 107, 0.3);

  .logo-icon {
    width: 40px;
    height: 40px;
    filter: brightness(0) invert(1);
  }
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  color: #17233d;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.app-subtitle {
  font-size: 14px;
  color: #808695;
  margin: 0;
}

.login-form {
  .form-input {
    :deep(.ant-input-prefix) {
      margin-right: 10px;
    }
  }

  .input-icon {
    color: #808695;
    font-size: 16px;
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #19be6b 0%, #0e9e55 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(25, 190, 107, 0.35);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(25, 190, 107, 0.5);
    transform: translateY(-1px);
  }

  &:disabled {
    background: linear-gradient(135deg, #a0c4a8 0%, #8ab098 100%);
    box-shadow: none;
    transform: none;
  }
}
</style>
