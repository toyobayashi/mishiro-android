<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: modalWidth }" v-if="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{live.fileName.substr(live.fileName.indexOf('-') + 1).split('.')[0]}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <form>
          <div>
            <!-- <label>{{$t("menu.lang")}}</label> -->
            <div style="display:flex;justify-content:space-between">
              <InputRadio text="D" value="1" v-model="difficulty" lable-id="d_1"/>
              <InputRadio text="R" value="2" v-model="difficulty" lable-id="d_2"/>
              <InputRadio text="P" value="3" v-model="difficulty" lable-id="d_3"/>
              <InputRadio text="M" value="4" v-model="difficulty" lable-id="d_4"/>
              <InputRadio v-if="hasMasterPlus" text="M+" value="5" v-model="difficulty" lable-id="s_5"/>
            </div>
          </div>
        </form>
        
      </div>
      <div class="modal-footer" style="justify-content: space-around">
        <Btn theme="ok" @click.native="yes">决定</Btn>
        <Btn @click.native="cancel">取消</Btn>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts" src="./v-modal-difficulty.ts">
</script>
