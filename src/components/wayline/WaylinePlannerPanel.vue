<template>
  <div class="wayline-planner-panel" v-if="waylineDraw.state.isPlanning">
    <div class="panel-header">
      <span class="panel-title">航线规划</span>
      <a-button type="text" size="small" style="color: #ff4d4f;" @click="onCancel">
        <CloseOutlined />
      </a-button>
    </div>

    <!-- Config Section -->
    <div class="panel-section">
      <div class="form-item">
        <label>航线名称</label>
        <a-input :value="waylineDraw.state.config.name" @change="(e: any) => onConfigChange('name', e.target.value)" size="small" placeholder="输入航线名称" />
      </div>
      <div class="form-row">
        <div class="form-item half">
          <label>飞行速度(m/s)</label>
          <a-input-number :value="waylineDraw.state.config.autoFlightSpeed" @change="(val: number) => onConfigChange('autoFlightSpeed', val)" :min="1" :max="15" size="small" style="width: 100%;" />
        </div>
        <div class="form-item half">
          <label>默认高度(m)</label>
          <a-input-number v-model:value="defaultHeight" :min="20" :max="500" size="small" style="width: 100%;" />
        </div>
      </div>
      <div class="form-item">
        <label>完成动作</label>
        <a-select :value="waylineDraw.state.config.finishAction" @change="(val: string) => onConfigChange('finishAction', val)" size="small" style="width: 100%;">
          <a-select-option value="goHome">返航</a-select-option>
          <a-select-option value="noAction">无动作(悬停)</a-select-option>
          <a-select-option value="autoLand">自动降落</a-select-option>
          <a-select-option value="gotoFirstWaypoint">返回第一个航点</a-select-option>
        </a-select>
      </div>
    </div>

    <!-- Waypoint List -->
    <div class="panel-section waypoint-list">
      <div class="section-header">
        <span>航点列表 ({{ waylineDraw.state.waypoints.length }})</span>
        <a-button type="text" size="small" @click="waylineDraw.removeLastWaypoint()" :disabled="waylineDraw.state.waypoints.length === 0">
          <UndoOutlined /> 撤销
        </a-button>
      </div>
      <div class="waypoints-scroll uranus-scrollbar">
        <div
          v-for="(wp, idx) in waylineDraw.state.waypoints"
          :key="idx"
          :class="['waypoint-item', { selected: idx === waylineDraw.state.selectedIndex }]"
          @click="onSelectWaypoint(idx)"
        >
          <div class="wp-index">{{ idx + 1 }}</div>
          <div class="wp-info">
            <span class="wp-coord">{{ wp.lng.toFixed(5) }}, {{ wp.lat.toFixed(5) }}</span>
            <div class="wp-alt-row">
              <span>高度:</span>
              <a-input-number
                :value="wp.height"
                @change="(val: number) => waylineDraw.updateWaypoint(idx, { height: val })"
                :min="5"
                :max="1500"
                size="small"
                style="width: 70px;"
              /> m
            </div>
          </div>
          <a-button type="text" size="small" style="color: #ff4d4f;" @click.stop="waylineDraw.removeWaypoint(idx)">
            <DeleteOutlined />
          </a-button>
        </div>
        <div v-if="waylineDraw.state.waypoints.length === 0" class="empty-tip">
          点击地图添加航点
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="panel-actions">
      <a-button @click="onCancel" style="flex: 1;">取消</a-button>
      <a-button
        type="primary"
        @click="onSave"
        :loading="waylineDraw.saving.value"
        :disabled="waylineDraw.state.waypoints.length < 2"
        style="flex: 1;"
      >
        保存航线
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits } from 'vue'
import { CloseOutlined, UndoOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { useWaylineDraw } from './use-wayline-draw'

const props = defineProps<{
  waylineDraw: ReturnType<typeof useWaylineDraw>
}>()

const emit = defineEmits(['saved', 'cancelled'])

const defaultHeight = ref(50)

function onConfigChange (key: string, value: any) {
  ;(props.waylineDraw.state.config as any)[key] = value
}

function onSelectWaypoint (idx: number) {
  props.waylineDraw.state.selectedIndex = idx
}

async function onSave () {
  const success = await props.waylineDraw.saveWayline()
  if (success) {
    emit('saved')
  }
}

function onCancel () {
  props.waylineDraw.cancelPlanning()
  emit('cancelled')
}
</script>

<style lang="scss" scoped>
.wayline-planner-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 300px;
  max-height: calc(100vh - 80px);
  background: rgba(35, 35, 35, 0.95);
  border-radius: 8px;
  color: #fff;
  z-index: 200;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    border-bottom: 1px solid #4f4f4f;

    .panel-title {
      font-size: 14px;
      font-weight: 600;
    }
  }

  .panel-section {
    padding: 10px 14px;
    border-bottom: 1px solid #3a3a3a;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .form-item {
    margin-bottom: 8px;

    label {
      display: block;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 4px;
    }
  }

  .form-row {
    display: flex;
    gap: 8px;

    .half {
      flex: 1;
    }
  }

  .waypoint-list {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .waypoints-scroll {
      flex: 1;
      max-height: 250px;
      overflow-y: auto;
    }
  }

  .waypoint-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    margin-bottom: 4px;
    background: #2a2a2a;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #363636;
    }

    &.selected {
      background: #1a3a5c;
      border: 1px solid #1890ff;
    }

    .wp-index {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #00aaff;
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .wp-info {
      flex: 1;
      min-width: 0;

      .wp-coord {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
      }

      .wp-alt-row {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
        font-size: 11px;
      }
    }
  }

  .empty-tip {
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    padding: 30px 0;
    font-size: 13px;
  }

  .panel-actions {
    display: flex;
    gap: 8px;
    padding: 12px 14px;
    border-top: 1px solid #4f4f4f;
  }
}
</style>
