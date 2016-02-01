PPAPI_FLASH_PATH="${HOME}/.config/google-chrome/PepperFlash/20.0.0.286/libpepflashplayer.so"
PPAPI_FLASH_VERSION="20.0.0.286"

all: deploy

run:
	electron ../app --ppapi-flash-path=${PPAPI_FLASH_PATH} --ppapi-flash-version=${PPAPI_FLASH_VERSION}

deploy:
	echo "This should do the package wrapping/building"
