git clone git@github.com:t-comin/botbuilder-js.git botbuilder-js.mcw

git checkout mcw/cldialog


## build

under botbuilder-js.mcw:

-> npm run postinstall

-> npm run build


## run adaptive demo

-> cd samples\51.clDialog\

-> tsc

-> npm run start

open emulator


## run declarative demo

under botbuilder-js.mcw:

-> node node_modules\mocha\bin\mocha .\libraries\botbuilder-dialogs-declarative\tests\\*.test.js


