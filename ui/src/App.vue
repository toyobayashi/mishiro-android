<template>
<div class="root" id="root">
  <keep-alive>
    <router-view class="page" v-if="$route.meta.keepAlive"></router-view>
  </keep-alive>

  <router-view class="page" v-if="!$route.meta.keepAlive"></router-view>
  <ModalLoading />
  <ModalConfirm />
  <ModalAlert />
</div>
</template>

<script lang="ts" src="./v-app.ts">
</script>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-size: 14px;
}
.page {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  /* display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; */
}
.text-center {
  text-align: center
}
.flex-center{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.flex-between{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.a, .a:visited {
  color: #0366d6;
  text-decoration: none;
}

.a:hover {
  text-decoration: underline;
}
</style>
