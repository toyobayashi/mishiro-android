<template>
<div class="index">
  <audio v-audio-init loop="loop" @timeupdate="timeUpdated"></audio>
  <div class="header">

    <div class="title">mishiro</div>
    <div @click="infoBtnClicked" class="info"></div>
    <div class="input-wrapper" :class="{ show: inputShow }">
      <input type="text" class="search-input" ref="searchInput" v-model="searchText" placeholder="搜索乐曲" />
      <div class="close flex-center" v-show="inputShow" @click="clearText"></div>
    </div>
    
    <div @click="searchBtnClicked" class="search flex-center"></div>
  </div>

  <div class="tab flex-between">
    <div class="tab-item text-center" @click="tabClicked(tab)" :class="{ active: currentTab === tab }" v-for="tab in tabList" :key="tab">{{tab}}</div>
    <div class="underline" :style="{ left: currentTab === tabList[0] ? '10%' : '60%' }"></div>
  </div>

  <div @scroll="scrolled" ref="audioList" :style="{ height: currentPlaying ? 'calc(100% - 70px)' : void 0 }" class="audio-list" :class="{ 'flex-center': liveList.length === 0 && bgmList.length === 0 }" v-swipe-right="swipeRight" v-swipe-left="swipeLeft">
    <Spinner style="position: static" v-if="!isBrowser && liveList.length === 0 && bgmList.length === 0" />
    <div v-show="currentTab === 'LIVE'">
      <Item
        v-for="item in liveListDisplay"
        :key="item.hash"
        :id="item.fileName.indexOf('song') !== 0 ? item.fileName.split('-')[0] : item.fileName.split('_')[1].split('.')[0]"
        :content="item.fileName.split('-')[1] ? item.fileName.split('-')[1].split('.')[0] : item.fileName.split('.')[0]"
        :button="item.status === 'downloading' ? 'stop' : (item.status === 'stoped' ? 'download' : 'none')"
        :loaded="item.loaded"
        @click.native="itemClicked(item)"
        @download="downloadClicked(item)"
        @stop="stopClicked(item)"
        @press="pressed(item)" />
    </div>
    <div v-show="currentTab === 'BGM'">
      <Item
        v-for="item in bgmListDisplay"
        :key="item.hash"
        :content="item.fileName.split('.')[0]"
        :button="item.status === 'downloading' ? 'stop' : (item.status === 'stoped' ? 'download' : 'none')"
        :loaded="item.loaded"
        @click.native="itemClicked(item)"
        @download="downloadClicked(item)"
        @stop="stopClicked(item)"
        @press="pressed(item)" />
    </div>
  </div>

  <div class="footer" v-show="currentPlaying">
    <Btn theme="ok" style="margin: 3px 0;" @click.native="scoreClicked" v-if="currentPlaying && currentPlaying.score && currentPlaying.scoreHash">谱面</Btn>
    <div class="player">
      <div class="audio-title flex-center">
        <span class="text">{{currentPlaying ? currentPlaying.fileName.split('.')[0] : ''}}</span>
      </div>
      <BtnProgress :loaded="audioProgress" class="btn-play" :type="isPlaying ? 'pause' : 'play'" @click.native="pauseBtnClicked" />
    </div>
  </div>

  <ModalDifficulty />
</div>
</template>

<script lang="ts" src="./v-index.ts">
</script>

<style scoped>
.player {
  width: 100%;
  position: relative;
}
.player .btn-play {
  position: absolute;
  right: 10px;
  top: 10px;
}
.player .audio-title {
  width: calc(100% - 70px);
  height: 100%;
}
.player .audio-title .text {
  font-size: 16px;
  word-wrap: break-word;
  width: calc(100% - 20px);
}
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 70px;
  border-top: 1px solid #aaa;
  background: linear-gradient(180deg, #f0f0f0, #d0d0d0);
  display: flex;
}

.header {
  height: 50px;
  width: 100%;
  background: rgb(141, 206, 214);
  line-height: 50px;
  font-size: 18px;
  color: #fff;
  top: 0;
  position: absolute;
  z-index: 100;
}

.header .title {
  font-size: 22px;
  width: 100%;
  height: 100%;
  position: absolute;
  text-align: center;
}

::-webkit-input-placeholder {
  color: #eee;
}

.input-wrapper {
  width: 0;
  height: 40px;
  line-height: 40px;
  margin: 5px 0;
  position: absolute;
  right: 60px;
  overflow: hidden;
  transition: width ease-in-out 0.1s;
  -webkit-transition: width ease-in-out 0.15s;
  background: rgb(141, 206, 214);
}

.input-wrapper.show {
  width: calc(100% - 70px);
  width: -webkit-calc(100% - 70px);
}

.search-input {
  display: inline-block;
  outline: none;
  background: transparent;
  border: none;
  border-bottom: 2px solid #fff;
  width: 100%;
  height: 40px;
  line-height: 40px;
  vertical-align: top;
  color: #fff;
  font-size: 20px;
  transition: border-color ease-in-out .15s;
  -webkit-transition: border-color ease-in-out .15s;
}

.search-input:focus {
  border-bottom: 2px solid #f1e3f1;
}

.close::before {
  content: "\2716";
  width: 25px;
  height: 25px;
  line-height: 24px;
  text-align: center;
  font-size: 16px;
  position: absolute;
  right: 5px;
  top: 7px;
  /* background: -webkit-linear-gradient(135deg, rgb(245, 182, 180), rgb(199, 84, 80));
  background: linear-gradient(135deg, rgb(245, 182, 180), rgb(199, 84, 80)); */
  border-radius: 50%;
}

.info {
  width: 30px;
  height: 50px;
  position: absolute;
  top: 0;
  left: 10px;
  background-repeat: no-repeat;
  background-position: 0px 10px;
  background-image: url('data:image/svg+xml;utf8,<svg t="1549122748688" width="30" height="30" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1196" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M512 0C229.665391 0 0 229.665391 0 512 0 614.578087 30.230261 713.594435 87.462957 798.274783 97.792 813.568 118.53913 817.574957 133.832348 807.268174 149.103304 796.93913 153.132522 776.169739 142.803478 760.898783 93.072696 687.282087 66.782609 601.221565 66.782609 512 66.782609 266.50713 266.50713 66.782609 512 66.782609 757.49287 66.782609 957.217391 266.50713 957.217391 512 957.217391 757.49287 757.49287 957.217391 512 957.217391 420.685913 957.217391 332.933565 929.792 258.248348 877.879652 243.044174 867.350261 222.274783 871.067826 211.767652 886.227478 201.238261 901.36487 204.978087 922.178783 220.115478 932.685913 306.064696 992.434087 406.995478 1024 512 1024 794.334609 1024 1024 794.334609 1024 512 1024 229.665391 794.334609 0 512 0ZM512.004452 237.895235C475.118191 237.895235 445.221843 267.791583 445.221843 304.677843 445.221843 341.564104 475.118191 371.460452 512.004452 371.460452 548.890713 371.460452 578.787061 341.564104 578.787061 304.677843 578.787061 267.791583 548.890713 237.895235 512.004452 237.895235ZM512 429.935304C481.257739 429.935304 456.347826 454.845217 456.347826 485.587478L456.347826 752.717913C456.347826 783.460174 481.257739 808.370087 512 808.370087 542.742261 808.370087 567.652174 783.460174 567.652174 752.717913L567.652174 485.587478C567.652174 454.845217 542.742261 429.935304 512 429.935304Z" p-id="1197" fill="rgb(255, 255, 255)"></path></svg>');
}

.search {
  width: 50px;
  height: 50px;
  position: absolute;
  top: 0;
  right: 0;
  background-repeat: no-repeat;
  background-position: 5px 5px;
  background-image: url('data:image/svg+xml;utf8,<svg t="1548683890425" width="40" height="40" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1736" id="mx_n_1548683890429" data-spm-anchor-id="a313x.7781069.0.i1" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M448 140.8A307.2 307.2 0 1 1 140.8 448 307.84 307.84 0 0 1 448 140.8M448 64a384 384 0 1 0 384 384 384 384 0 0 0-384-384z" fill="rgb(255, 255, 255)" p-id="1737"></path><path d="M741.76 648.96l-90.24 90.24L832 920.32A64 64 0 0 0 922.88 832l-181.12-181.12z" fill="rgb(255, 255, 255)" p-id="1738"></path></svg>')
}

.tab {
  height: 40px;
  width: 100%;
  /* background: hotpink; */
  background: rgb(141, 206, 214);
  text-align: center;
  line-height: 40px;
  color: #eee;
  top: 50px;
  position: absolute;
  z-index: 100;
}

.tab > .tab-item {
  font-size: 16px;
  width: 50%;
}

.tab > .tab-item.active {
  font-weight: bold;
  /* color: rgb(213, 240, 178); */
  color: #fff;
}

.tab > .underline {
  position: absolute;
  bottom: 2px;
  left: 10%;
  width: 30%;
  height: 3px;
  background: #fff;
  -webkit-transition: left ease-out .1s;
  transition: left ease-out .1s;
}

.audio-list {
  padding-top: 90px;
  /* position: absolute;
  top: 0;
  left: 0; */
  /* width: 100%; */
  height: 100%;
  overflow: auto;
}

.select {
  height: 25px;
  line-height: 25px;
  font-size: 15px;
}
</style>
