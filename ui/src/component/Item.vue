<template>
<div class="item" :style="{ 'background-size': loaded + '% 100%' }" v-press="press">
  <div v-if="id" class="item-id">{{id}}</div>
  <div class="item-content" :style="{ width: (button !== 'none') ? '-webkit-calc(80% - 50px)' : '80%' }">{{content}}</div>
  <div class="item-btn item-btn-download" v-if="button === 'download'" @click.stop="downloadBtnClicked"></div>
  <div class="item-btn item-btn-stop" v-if="button === 'stop'" @click.stop="stopBtnClicked"></div>
</div>
</template>

<script lang="ts" src="./v-item.ts">
</script>

<style scoped>
.item {
  width: 100%;
  height: 50px;
  line-height: 50px;
  display: flex;
  position: relative;
  border-bottom: 1px solid rgb(141, 206, 214);
  background-color: #f0f0f0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1'><rect width='100%' height='100%' style='fill:rgb(215, 253, 209)' /></svg>");
  background-repeat: no-repeat;
  background-size: 0% 100%;
}

.item:nth-last-child(1) {
  border-bottom: none;
}

.item:active {
  opacity: 0.7;
}

.item .item-id {
  font-size: 14px;
  width: 20%;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-left: 5px;
}

.item .item-content {
  font-size: 14px;
  /* width: 80%; */
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-left: 5px;
}

.item .item-btn {
  width: 50px;
  height: 50px;
  position: absolute;
  right: 0;
  top: 0;
  /* background-color: #eee; */
}

.item .item-btn.item-btn-download {
  background-repeat: no-repeat;
  background-position: 5px 5px;
  background-image: url('data:image/svg+xml;utf8,<svg width="40" height="40" t="1548771682369" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3093" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M480 631.04V96a32 32 0 0 1 64 0v535.04l265.216-269.44a32 32 0 1 1 45.568 44.8L544 722.496a44.928 44.928 0 0 1-63.872 0L169.216 406.4a32 32 0 1 1 45.568-44.928L480 631.104z m384 232.96V640a32 32 0 1 1 64 0v243.2a44.8 44.8 0 0 1-44.8 44.8H140.8a44.8 44.8 0 0 1-44.8-44.8V640a32 32 0 0 1 64 0v224h704z" p-id="3094" fill="rgb(141, 206, 214)"></path></svg>')
}

.item .item-btn.item-btn-stop {
  background-repeat: no-repeat;
  background-position: 5px 5px;
  background-image: url('data:image/svg+xml;utf8,<svg width="40" height="40" t="1548773628789" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5306" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M512 128a382.6 382.6 0 1 1-149.45 30.15A381.54 381.54 0 0 1 512 128m0-64C264.58 64 64 264.58 64 512s200.58 448 448 448 448-200.58 448-448S759.42 64 512 64z" p-id="5307" fill="rgb(199, 84, 80)"></path><path d="M320 320l384 0 0 384-384 0 0-384Z" p-id="5308" fill="rgb(199, 84, 80)"></path></svg>')
}

</style>

