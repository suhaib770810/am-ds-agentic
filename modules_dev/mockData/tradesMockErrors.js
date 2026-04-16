let flexMockErrors = {
    "1020": {
        FlexStatementResponse: {
          '$': { timestamp: '08 May, 2025 03:58 PM EDT' },
          Status: 'Fail',
          ErrorCode: '1020',
          ErrorMessage: 'Invalid request or unable to validate request.'
        }
    }, 
    "1018": {
        FlexStatementResponse: {
          '$': { timestamp: '08 May, 2025 03:58 PM EDT' },
          Status: 'Warn',
          ErrorCode: '1018',
          ErrorMessage: 'Too many requests have been made from this token. Please try again shortly.'
        }
    },
    "1019": {
        FlexStatementResponse: {
          '$': { timestamp: '08 May, 2025 03:58 PM EDT' },
          Status: 'Warn',
          ErrorCode: '1019',
          ErrorMessage: 'Flex statement is still being processed. Please try again shortly.'
        }
    },
}

export default flexMockErrors;