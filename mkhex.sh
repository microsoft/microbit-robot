set -e

makecode -f size
makecode -c mkc-keystudiominismartrobot.json -f size
cp ./built/mbdal-binary.hex ./assets/keystudio-minismartrobot-for-microbit-v1.hex
cp ./built/mbcodal-binary.hex ./assets/keystudio-minismartrobot-for-microbit-v2.hex
makecode -c mkc-kittenbotrobotbit.json -f size
cp ./built/mbdal-binary.hex ./assets/kittenbot-robotbit-for-microbit-v1.hex
cp ./built/mbcodal-binary.hex ./assets/kittenbot-robotbit-for-microbit-v2.hex
makecode -c mkc-elecfreakscutebot.json -f size
cp ./built/mbdal-binary.hex ./assets/elecfreaks-cutebot-for-microbit-v1.hex
cp ./built/mbcodal-binary.hex ./assets/elecfreaks-cutebot-for-microbit-v2.hex
makecode -c mkc-elecfreakscutebotpro.json -f size
cp ./built/mbdal-binary.hex ./assets/elecfreaks-cutebotpro-for-microbit-v1.hex
cp ./built/mbcodal-binary.hex ./assets/elecfreaks-cutebotpro-for-microbit-v2.hex
makecode -c mkc-yahboomtinybit.json -f size
cp ./built/mbdal-binary.hex ./assets/yahboom-tinybit-for-microbit-v1.hex
cp ./built/mbcodal-binary.hex ./assets/yahboom-tinybit-for-microbit-v2.hex
makecode -c mkc-dfrobotmaqueen.json -f size
cp ./built/mbdal-binary.hex ./assets/dfrobot-maqueen-for-microbit-v1.hex
cp ./built/mbcodal-binary.hex ./assets/dfrobot-maqueen-for-microbit-v2.hex
makecode -c mkc-dfrobotmaqueenplusv2.json -f size
cp ./built/mbdal-binary.hex ./assets/dfrobot-maqueen-plus-for-microbit-v1.hex
cp ./built/mbcodal-binary.hex ./assets/dfrobot-maqueen-plus-for-microbit-v2.hex
makecode -c mkc-kittenbotminilfr.json -f size
cp ./built/mbdal-binary.hex ./assets/kittenbot-minilfr-for-microbit-v1.hex
cp ./built/mbcodal-binary.hex ./assets/kittenbot-minilfr-for-microbit-v2.hex
makecode -c mkc-kittenbotnanobit.json -f size
cp ./built/mbdal-binary.hex ./assets/kittenbot-nanobit-for-microbit-v1.hex
cp ./built/mbcodal-binary.hex ./assets/kittenbot-nanobit-for-microbit-v2.hex
makecode -c mkc-kitronikmotordriverrccar.json -f size
cp ./built/mbdal-binary.hex ./assets/kitronik-motor-driver-rc-car-for-microbit-v1.hex
cp ./built/mbcodal-binary.hex ./assets/kitronik-motor-driver-rc-car-for-microbit-v2.hex
makecode -c mkc-inksmithk8.json -f size
cp ./built/mbdal-binary.hex ./assets/inksmith-k8-for-microbit-v1.hex
cp ./built/mbcodal-binary.hex ./assets/inksmith-k8-for-microbit-v2.hex
cd fwdedu
makecode -f size
cd ..
cp ./fwdedu/built/mbcodal-binary.hex ./assets/fwdedu-for-microbit-v2.hex

cd protocol
makecode
