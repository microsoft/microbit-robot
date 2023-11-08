#include "pxt.h"

#define CALIBRATION_KEY "robot"

namespace robot {
    struct Calibration {
        int radioGroup;
        int drift;
    };

    //%
    void __writeCalibration(int radioGroup, int drift) {
        Calibration cal;
        cal.radioGroup = radioGroup;
        cal.drift = drift;
        uBit.storage.put(CALIBRATION_KEY, (uint8_t *)&cal, sizeof(Calibration));
    }

    //%
    int __readCalibration(int field) {
        KeyValuePair* kv = uBit.storage.get(CALIBRATION_KEY);
        int value = 0;
        if (NULL != kv) {
            Calibration cal;
            memcpy(&cal, kv->value, sizeof(Calibration));
            if (field == 0)
                value = cal.radioGroup;
            else if (field == 1)
                value = cal.drift;
        }
        return value;
    }
}