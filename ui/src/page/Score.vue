<template>
<div>
  <div style="background: rgba(0,0,0,0.8);position:fixed;width:100%;height:100%"></div>
  <Btn style="position:absolute;z-index:100;top:2%;left:1%" @click.native="playClicked">{{playBtnText}}</Btn>
  <Btn style="position:absolute;z-index:100;top:calc(2% + 84px);left:1%" theme="ok" @click.native="saveClicked">保存</Btn>
</div>
</template>

<script lang="ts" src="./v-score.ts">
</script>

<style>
.canvas {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.canvas-middle {
  width: 100%;
}

.canvas-center {
  height: 100%;
}

.img-middle {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: -1000;
}

.img-center {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 100%;
  z-index: -1000;
}

.combo {
	position: absolute;
	top: 5%;
  right: 5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.combo > .combo-number {
	-webkit-text-stroke: 2px rgb(240,144,0);
	color: #f0f0f0;
	font-size: 60px;
  font-weight: bold;
  height: 60px;
  line-height: 60px;
}
.combo > .combo-text {
	-webkit-text-stroke: 1px rgb(240,144,0);
	color: #f0f0f0;
	font-size: 25px;
  height: 25px;
  line-height: 25px;
}

.hp-bar{
	position: absolute;
	top: 5%;
	left: 10%;
	box-sizing: border-box;
	width: 231px;
	height: 28px;
	border: 1px solid #505050;
	background: #f0f0f0;
	border-radius: 5px;
}
.hp-bar>div{
	position: relative;
	box-sizing: border-box;
	width: 215px;
	height: 20px;
	background: linear-gradient(180deg, #606060, #808080);
	border-radius: 4px;
	margin: 3px 7px;
	overflow: hidden;
}
.hp-bar .hp{
	background: linear-gradient(180deg, #40d000, #b0f070 30%, #50d030);
	width: 80.5%;
	height: 20px;
	transition: width .2s linear;
}
.hp-bar .hp.warning{
	background: linear-gradient(180deg, #f0c010, #f0e080 30%, #f0a000);
}
.hp-bar .hp.dangerous{
	background: linear-gradient(180deg, #e04000, #f08070 30%, #c04000);
}


.cgss-btn{
  display: inline-block;
  white-space: nowrap;
  touch-action: manipulation;
  user-select: none;
  cursor: pointer;
  width: 152px;
  height: 64px;
  border: none;
  outline: none;
  color: #fff;
  border-radius: 10px;
  font-size: 30px;
  padding-bottom: 10px;
  margin:0;
}
.cgss-btn:active {
  background-color: rgb(210, 124, 218);
}
.cgss-btn-ok{
  background-color: rgb(243, 142, 252);
}
.cgss-btn-star{
  color:#323232;
}

input[type=range] {
  display: block;
  position: relative;
  width: 90%;
  margin-top: 10px;
  height: 5px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  -ms-progress-appearance: none;
  background-color: #aaa;
  border-radius: 5px;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1'><rect width='100%' height='100%' style='fill:rgb(64,208,34)' /></svg>");
  background-repeat: no-repeat;
  background-size: 0% 100%;
  cursor: pointer;
  outline: none;
}
input[type=range]::-webkit-slider-thumb:hover {
  background-color: #ddadd7;
}
input[type=range]::-webkit-slider-thumb:active {
  background-color: #e070d0;
}
input[type=range]::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  -ms-progress-appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background-color: #e0b5db;
  cursor: default;
  -webkit-box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
}
</style>
