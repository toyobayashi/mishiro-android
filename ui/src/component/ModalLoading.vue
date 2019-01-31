<template>
<div class="the-loading flex-center" v-show="show">
  <TaskPanel :text="text" :loaded="loaded" />
  <Btn v-if="btnCall" class="close" theme="ok" @click.native="close">取消</Btn>
  <Spinner />
</div>
</template>

<script lang="ts" src="./v-modal-loading.ts">
</script>

<style scoped>
.the-loading {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.66);
  z-index: 1000;
}
.the-loading .close {
  position: absolute;
  bottom: 20%;
}
</style>
