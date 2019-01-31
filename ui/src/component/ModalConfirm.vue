<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div v-show="visible" :style="{ width: modalWidth }">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{title}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }" v-html="body"></div>
      <div class="modal-footer" style="justify-content: space-around">
        <Btn theme="ok" @click.native="yes">确定</Btn>
        <Btn @click.native="no">取消</Btn>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts" src="./v-modal-confirm.ts">
</script>
