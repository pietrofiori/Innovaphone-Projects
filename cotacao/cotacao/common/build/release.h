
#if !defined(RELEASE_STATE)
#define RELEASE_STATE "danilo"
#endif

#define VERSION_STR_MAJOR "lula"
#define VERSION_STR "lula"
#define VERSION_SOAP 1300

#define BUILD_DO_QUOTE(X)         #X
#define BUILD_QUOTE(X)            BUILD_DO_QUOTE(X)
#define BUILD_DO_CONCATENATE(X,Y) X##Y
#define BUILD_CONCATENATE(X,Y)    BUILD_DO_CONCATENATE(X,Y)
#if (!defined(BUILD))
#define BUILD
#endif
#if ASCOM_BUILD == 1
#define BUILD_STRING              BUILD_QUOTE(BUILD)
#else
#if (((BUILD_CONCATENATE(0x1,BUILD) >= 0x1a)       && (BUILD_CONCATENATE(0x1,BUILD) <= 0x1f)) \
  || ((BUILD_CONCATENATE(0x1,BUILD) >= 0x1a0)      && (BUILD_CONCATENATE(0x1,BUILD) <= 0x1ff)) \
  || ((BUILD_CONCATENATE(0x1,BUILD) >= 0x1a00)     && (BUILD_CONCATENATE(0x1,BUILD) <= 0x1fff)) \
  || ((BUILD_CONCATENATE(0x1,BUILD) >= 0x1a000)    && (BUILD_CONCATENATE(0x1,BUILD) <= 0x1ffff)) \
  || ((BUILD_CONCATENATE(0x1,BUILD) >= 0x1a0000)   && (BUILD_CONCATENATE(0x1,BUILD) <= 0x1fffff)) \
  || ((BUILD_CONCATENATE(0x1,BUILD) >= 0x1a00000)  && (BUILD_CONCATENATE(0x1,BUILD) <= 0x1ffffff)) \
  || ((BUILD_CONCATENATE(0x1,BUILD) >= 0x1a000000) && (BUILD_CONCATENATE(0x1,BUILD) <= 0x1fffffff)))
#error BUILD must start with a digit 0..9
#elif (BUILD_CONCATENATE(0x1,BUILD) == 0x1)
#define BUILD_STRING              "13A000"
#else
#define BUILD_STRING              BUILD_QUOTE(BUILD)
#endif
#endif

NAMESPACE_BEGIN
const char * _BUILD_STRING_ = BUILD_STRING;
const char * __BUILD_STRING__ = "/" BUILD_STRING "/";
const char * _VERSION_STR_ = VERSION_STR;
const char * _RELEASE_STATE_ = RELEASE_STATE;
const int _VERSION_SOAP_ = VERSION_SOAP;
NAMESPACE_END
