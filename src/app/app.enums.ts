export enum STORAGE {
  ATFS = 'atfs',
  DEFECTS = 'defects',
  TESTTYPES = 'test-types',
  PREPARERS = 'preparers',
  TECH_RECORDS = 'tech-records',
  STATE = 'state',
  VISIT = 'visit',
  ACTIVITIES = 'activities',
  TEST_HISTORY = 'test-history',
  JWT_TOKEN = 'jwt-token',
  SIGNATURE = 'signature-image'
}

export enum PATHS {
  TECH_RECORDS = "tech-records"
}

export enum STATUS_CODE {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403
}

export enum LOCAL_STORAGE {
  INIT_SYNC = 'initSyncDone',
  FIRST_INIT = 'firstInit',
  EASTER_EGG = 'easterEgg',
  CACHING = 'caching',
  TESTER_DETAILS = 'tester-details',
  JWT_TOKEN = 'jwt-token',
  SIGNATURE = 'signature-image',
  IS_TEST_SUBMITTED = 'is-test-submitted'
}

export enum APP {
  INIT_SYNC = 'initSyncDone',
  NAV_OUT = 'navigatedOutOfPage',
  TEST_SUBMITTED = 'testSubmitted',
  TEST_TYPES_UPDATE_COMPLETED_FIELDS = 'updateCompletedFields'
}

export enum TESTER_ROLES {
  FULL_ACCESS = 'CVSFullAccess',
  PSV = 'CVSPsvTester',
  HGV = 'CVSHgvTester',
  ADR = 'CVSAdrTester',
  TIR = 'CVSTirTester'
}

export enum DEFICIENCY_CATEGORY {
  ADVISORY = 'advisory',
  DANGEROUS = 'dangerous',
  MAJOR = 'major',
  PRS = 'prs',
  MINOR = 'minor'
}

export enum TEST_REPORT_TITLES {
  SINGLE_TEST = 'Single Test',
  LINKED_TEST = 'Linked Test',
  COMBINED_TEST = 'Combined Test'
}

export enum TEST_REPORT_STATUSES {
  SUBMITTED = 'submitted',
  CANCELLED = 'cancelled'
}

export enum TEST_TYPE_RESULTS {
  ABANDONED = 'abandoned',
  FAIL = 'fail',
  PASS = 'pass',
  PRS = 'prs',
}

export enum TEST_COMPLETION_STATUS {
  IN_PROGRESS = 'in progress',
  EDIT = 'edit'
}

export enum TEST_TYPE_FIELDS {
  DDL = 'ddl',
  NUMBER = 'number',
  DATE = 'date',
  CERTIFICATE_NUMBER_CUSTOM = 'certificateNumberCustom'
}

export enum TEST_TYPE_INPUTS {
  SIC_CARRIED_OUT = 'seatbeltInstallationCheckDate',
  SIC_SEATBELTS_NUMBER = 'numberOfSeatbeltsFitted',
  SIC_LAST_DATE = 'lastSeatbeltInstallationCheckDate',
  CERTIFICATE_NUMBER = 'certificateNumber'
}

export enum APP_COLORS {
  ATTENTION = 'attention',
  DANGER = 'danger',
  DARK = 'dark',
  LIGHT = 'light',
  TERTIARY = 'tertiary'
}

export enum APP_STRINGS {
  VEHICLE_DETAILS = 'Vehicle details',
  WITHOUT_PREPARER = 'Continue without preparer ID',
  CONFIRM_PREPARER = 'You are about to add this preparer to the test.',
  ADD_PREPARER_INFO_TEXT = 'If you are shown a preparer ID, add this to the test now',
  WITHOUT_PREPARER_MSG = "You won't be able to add this information later.",
  PREPARER_NOT_FOUND = "Preparer not found",
  PREPARER_NOT_FOUND_MSG = "You can continue without adding a preparer ID or search again.",
  SEARCH_AGAIN = 'Search again',
  CONTINUE = 'Continue',
  CANCEL = 'Cancel',
  CONFIRM = 'Confirm',
  SUBMIT = 'Submit',
  OK = 'OK',
  YES = 'Yes',
  NO = 'No',
  SAVE = 'Save',
  REPORT_ISSUE = 'Report issue',
  TEST_STATION_SAFETY = 'Confirm ATF and safety',
  REPORT_TITLE = 'Report an ATF issue',
  SPEAK_TO_TTL = 'Speak to your Technical Team Leader (TTL) if the issue cannot be resolved on site.',
  SEARCH_TEST_STATION = 'Find an ATF',
  CALL = 'Call',
  TEST_TYPE = 'Test type',
  NO_SEATBELTS_ENTERED = 'No seatbelts entered',
  NO_SEATBELTS_ENTERED_SUBTITLE = 'The number of seatbelts fitted must be greater than zero (0) to carry out an installation check.',
  COMPLETE_ALL_TESTS = 'You must complete all test types marked "in progress" before reviewing.',
  TEST_NOT_COMPLETE = 'Test not complete',
  NO_TESTS_ADDED = 'No test type added',
  PLEASE_ADD_TEST = 'Add a test type before reviewing.',
  REMOVE = 'Remove',
  REMOVE_TEST_TITLE = 'Remove test',
  REMOVE_TEST_MSG = 'This action will remove this test from the vehicle.',
  NO_HISTORY = 'No test history found for this vehicle',
  CONFIRM_VEHICLE = 'Confirm vehicle',
  CONFIRM_VEHICLE_MSG = 'This action will confirm the vehicle for testing.',
  DEFECT_CAT = 'Defect category',
  DEFECT_ITEM = 'Defect item',
  DEFECT_DESC = 'Defect description',
  TEST = 'Test',
  IDENTIFY_VEHICLE = 'Identify vehicle',
  IDENTIFY_TRAILER = 'Identify trailer',
  TEST_HISTORY = 'Test history',
  SUBMIT_TEST = 'Submit test',
  SUBMIT_TESTS = 'Submit tests',
  NEXT_VEHICLE = 'Next vehicle',
  SUBMIT_TEST_MESSAGE = 'You will not be able to make changes to this test after it has been submitted.',
  SUBMIT_TEST_TOAST_MESSAGE = 'The test has been submitted and emailed.',
  UNABLE_TO_SUBMIT_TESTS_TITLE = 'Unable to submit test',
  UNABLE_TO_START_VISIT = 'Unable to start visit',
  UNABLE_TO_END_VISIT = 'Unable to end visit',
  NO_INTERNET_CONNECTION = 'Make sure you are connected to the Internet and try again.',
  SETTINGS_BTN = 'Settings',
  TRY_AGAIN_BTN = 'Try again',
  CALL_SUPP_BTN = 'Call technical support',
  END_VISIT_WAITING_TITLE = 'Enter reason',
  END_VISIT_WAITING_MSG = 'Before ending your visit, enter details about your time spent not testing.',
  END_VISIT_TITLE = 'End visit',
  END_VISIT_MSG = "You will not be able to add any other tests after you end this visit. Today's activity report will be sent to DVSA and ",
  END_VISIT_LOADING = 'Submitting site visit',
  REMOVE_DEFECT_TITLE = 'Remove defect',
  REMOVE_DEFECT_MSG = 'This action will remove this defect.',
  PLACEHOLDER_DEFECT_CAT = 'Search for a defect category or IM number',
  PLACEHOLDER_DEFECT_ITEM = 'Search for a defect item',
  PLACEHOLDER_DEFECT_DESC = 'Search for a defect description',
  APP_NAME = 'Vehicle Testing',
  APP_DESC_PT1 = 'Use this app to record commercial vehicle',
  APP_DESC_PT2 = 'tests at test facilities',
  SIGNATURE_TEXT = "Once you are happy with your signature, select 'Save'. After it has been saved, it cannot be edited and will be used each time you need to sign a certificate.",
  SIGNATURE_DIVIDER = 'use your finger to sign below',
  SIGN_CONF_TITLE = 'Save signature',
  SIGN_CONF_MSG = 'After it has been saved, it cannot be edited and will be used each time you need to sign a certificate.',
  SIGN_TOAST_MSG = "Your Signature has been saved and will be used each time you need to sign a certificate",
  SIGN_NOT_ENTERED = 'Signature not entered',
  SIGN_ENTER = 'You must enter your signature before saving.',
  SIGN_UNABLE_LOAD_DATA = 'Unable to load data',
  CACHING_ENABLED_STORAGE_CLEARED = 'Storage was cleared and caching was disabled. Ride on',
  CACHING_ENABLED = 'Caching was enabled',
  UNAUTHORISED = 'Unable to authorise',
  UNAUTHORISED_MSG = "Your account isn't currently authorised to use this app. Close the app or call IT support.",
  UNAUTHORISED_TEST_MSG = "Your account isn't currently authorised to test this vehicle. Call IT support.",
  WAIT_REASONS_MSG_ISSUE = "You've selected 'Site issue', give more details in notes section.",
  WAIT_REASONS_MSG_OTHER = "You've selected 'Other', give more details in notes section.",
  WAIT_REASONS_TITLE = "Add notes",
  PROHIBITION_TITLE = "Prohibition alert",
  PROHIBITION_MSG_NOTES = "Explain why you haven't issued a prohibition for this defect in the Notes section.",
  PROHIBITION_MSG_CONFIRM = "This defect requires you to issue a prohibition in Mobile Compliance. Confirm you’ve done this in the Prohibition section.",
  NO_PREPARER_ID_FOUND = 'No preparer ID found',
  NO_PREPARER_ID_GIVEN = 'No preparer ID given',
  TRAILER_ID_OR_VIN = 'Enter trailer ID or VIN',
  REG_NUMBER_TRAILER_ID_OR_VIN = 'Enter registration number, trailer ID or VIN',
  CONFIRMATION_MESSAGE_END_VISIT = 'Site visit has been submitted and sent to DVSA and ',
  CONFIRMATION_MESSAGE_SUBMIT_TEST = 'The tests have been submitted and will be emailed to ',
  CONFIRMATION_ADDITIONAL_MESSAGE_SUBMIT_TEST = 'If you do not receive the email, ',
  CONFIRMATION_ADDITIONAL_MESSAGE_BUTTON_SUBMIT_TEST = 'call central support',
  PROVISIONAL_LABEL_TEXT = "This is a provisional record.",
  TEST_CREATE_ERROR_BANNER = 'You must complete all vehicle and test type details before reviewing.'
}

export enum ODOMETER_METRIC {
  KILOMETRES = 'kilometres',
  MILES = 'miles',
  KM = 'km',
  MI = 'mi'
}

export enum DATE_FORMAT {
  DD_MM_YYYY = 'dd/MM/yyyy',
  D_MMM_YY = 'd MMM yy'
}

export enum DEFAULT_VALUES {
  NONE = 'None',
  NOT_ENTERED = 'Not entered'
}

export enum REG_EX_PATTERNS {
  NUMERIC = '[0-9]*'
}

export enum VEHICLE_TYPE {
  PSV = 'psv',
  HGV = 'hgv',
  TRL = 'trl'
}

export enum VEHICLE_SIZE {
  SMALL = 'small',
  LARGE = 'large'
}

export enum VEHICLE_CONFIGURATION {
  RIGID = 'rigid',
  ARTICULATED = 'articulated'
}

export enum TEST_STATION_TYPE {
  ATF = 'atf',
  GVTS = 'gvts',
  TECHNICAL_SECTION_OFFICE = 'tass',
  POTF = 'potf',
  OTHER = 'other'
}

export enum TEST_REPORT_STATUS {
  SUBMITTED = 'submitted',
  CANCELLED = 'cancelled'
}

export enum VEHICLE_CLASS {
  CLASS_1 = '1',
  CLASS_2 = '2',
  CLASS_3 = '3',
  CLASS_L = 'l',
  CLASS_N = 'n',
  CLASS_V = 'v',
  CLASS_T = 't',
  CLASS_S = 's',
}

export enum VEHICLE_STATUS {
  STATUS_1 = '1',
  STATUS_2 = '2',
  STATUS_3 = '3'
}

export enum EU_VEHICLE_CATEGORY {
  CAT_M1 = 'm1',
  CAT_M2 = 'm2',
  CAT_M3 = 'm3',
  CAT_N1 = 'n1',
  CAT_N2 = 'n2',
  CAT_N3 = 'n3',
  CAT_01 = 'o1',
  CAT_02 = 'o2',
  CAT_03 = 'o3',
  CAT_04 = 'o4'
}

export enum PROHIBITION_ISSUED {
  YES = 'yes',
  NO = 'no'
}

export enum TECH_RECORD_STATUS {
  ARCHIVED = 'archived',
  CURRENT = 'current',
  PROVISIONAL = 'provisional'
}

export enum AUTH {
  INVALID_TOKEN = 'Invalid Token',
  INTERNET_REQUIRED = 'Internet is required.',
  MS_ADAL_ERROR_CODE = 'AD_ERROR_UI_USER_CANCEL',
  MS_ADA_ERROR_USER_INPUT = 'AD_ERROR_SERVER_USER_INPUT_NEEDED'
}

export enum SIGNATURE_STATUS {
  SAVED = 'signature:saved',
  ERROR = 'signature:error',
  SAVED_EVENT = 'signature-saved'
}

export enum VISIT {
  ACTIVITY_TYPE_VISIT = 'visit',
  ACTIVITY_TYPE_WAIT = 'wait',
  ACTIVITY_TYPE_UNACCOUNTABLE_TIME = 'unaccountable time',
  ALREADY_ENDED = 'Activity already ended'
}


export enum PAGE_NAMES {
  TEST_STATION_SEARCH_PAGE = 'TestStationSearchPage',
  TEST_STATION_HOME_PAGE = 'TestStationHomePage',
  CATEGORY_READING_PAGE = 'CategoryReadingPage',
  REGION_READING_PAGE = 'RegionReadingPage',
  ODOMETER_READING_PAGE = 'OdometerReadingPage',
  TEST_CREATE_PAGE = 'TestCreatePage',
  TEST_ABANDONING_PAGE = 'TestAbandoningPage',
  COMPLETE_TEST_PAGE = 'CompleteTestPage',
  VEHICLE_DETAILS_PAGE = 'VehicleDetailsPage',
  VEHICLE_HISTORY_PAGE = 'VehicleHistoryPage',
  TEST_TYPES_LIST_PAGE = 'TestTypesListPage',
  REASONS_SELECTION_PAGE = 'ReasonsSelectionPage',
  TEST_CANCEL_PAGE = 'TestCancelPage',
  TEST_REVIEW_PAGE = 'TestReviewPage',
  SIGNATURE_PAD_PAGE = 'SignaturePadPage',
  VISIT_TIMELINE_PAGE = 'VisitTimelinePage',
  ADD_PREPARER_PAGE = 'AddPreparerPage',
  CONFIRMATION_PAGE = 'ConfirmationPage',
  VEHICLE_LOOKUP_PAGE = 'VehicleLookupPage',
  WAIT_TIME_REASONS_PAGE = 'WaitTimeReasonsPage'
}

export enum WAIT_TIME_REASONS {
  WAITING_FOR_VEHICLE = 'Waiting for vehicle',
  ADMIN = 'Admin',
  BREAK = 'Break',
  SITE_ISSUE = 'Site issue',
  OTHER = 'Other'
}

export enum FIREBASE {
  TEST_REVIEW_UNSUCCESSFUL = 'test_review_unsuccessful',
  MISSING_MADATORY_FIELD = 'missing_mandatory_field',
  COUNTRY_OF_REGISTRATION = 'countryOfRegistration',
  EU_VEHICLE_CATEGORY = 'euVehicleCategory',
  ODOMETER_READING = 'odometerReading',
  NOT_ALL_TESTS_COMPLETED = 'Not all tests completed before review',
  NO_TEST_ADDED = 'No test added before review',
  SUBMIT_TEST = 'submit_test',
  CANCEL_TEST = 'cancel_test',
  TEST_ERROR = 'test_error',
  TEST_EVENT = 'test_event',
  PAGE_VIEW = 'page_view',
  OPEN_APP = 'open_app',
  ERROR = 'error',
  ENDING_ACTIVITY_FAILED = 'Ending activity failed',
  TEST_SUBMISSION_FAILED = 'Test submission failed',
  ADD_ODOMETER_READING_TIME_TAKEN = 'add_odometer_reading_time_taken',
  ADD_ODOMETER_READING_START_TIME = 'add_odometer_reading_start_time',
  ADD_ODOMETER_READING_END_TIME = 'add_odometer_reading_end_time',
  CONFIRM_PREPARER_TIME_TAKEN = 'confirm_preparer_time_taken',
  CONFIRM_PREPARER_START_TIME = 'confirm_preparer_start_time',
  CONFIRM_PREPARER_END_TIME = 'confirm_preparer_end_time',
  SEARCH_VEHICLE_TIME_TAKEN = 'search_vehicle_time_taken',
  SEARCH_VEHICLE_START_TIME = 'search_vehicle_start_time',
  SEARCH_VEHICLE_END_TIME = 'search_vehicle_end_time',
  CONFIRM_VEHICLE_TIME_TAKEN = 'confirm_vehicle_time_taken',
  CONFIRM_VEHICLE_START_TIME = 'confirm_vehicle_start_time',
  CONFIRM_VEHICLE_END_TIME = 'confirm_vehicle_end_time',
  ADD_TEST_TYPE_TIME_TAKEN = 'add_test_type_time_taken',
  ADD_TEST_TYPE_START_TIME = 'add_test_type_start_time',
  ADD_TEST_TYPE_END_TIME = 'add_test_type_end_time',
  REMOVE_TEST_TYPE = 'remove_test_type',
  ABANDON_TEST_TYPE = 'abandon_test_type',
  TEST_TYPE_NAME = 'test_type_name'
}

export enum FIREBASE_AUTH {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_UNSUCCESSFUL = 'login_unsuccessful',
  LOGIN_SUCCESSFUL = 'login_successful',

  CLIENT_ID = 'client_id',
  REDIRECT_URL = 'redirect_url',
  RESOURCE_URL = 'resource_url',
  TENANT_ID = 'tenant_id',
  OID = 'OID',
  USER_ROLES = 'user_roles',
  ERROR_MESSAGE = 'error_message',
}

export enum FIREBASE_DEFECTS {
  ADD_DEFECT = 'add_defect',
  REMOVE_DEFECT = 'remove_defect',
  DEFECT_NOTES_USAGE = 'defect_notes_usage',
  ADD_DEFECT_TIME_TAKEN = 'add_defect_time_taken',
  DEFICIENCY_REFERENCE = 'deficiency_reference',
  ADD_DEFECT_START_TIME = 'add_defect_start_time',
  ADD_DEFECT_END_TIME = 'add_defect_end_time'
}

export enum LOG_TYPES {
  INFO = 'info',
  ERROR = 'error'
}

export enum LEC_CERTIFICATE_NUMBER_PREFIXES {
  LP = 'LP',
  LF = 'LF'
}

export enum SPEC_VALUES {
  CERTIFICATE_NUMBER = '67868977',
  LEC_CERTIFICATE_NUMBER = 'LP67868977'
}

export enum TEST_TYPES_IDS {
  _62 = '62',
  _63 = '63',
  _91 = '91',
  _101 = '101',
  _122 = '122'
}
