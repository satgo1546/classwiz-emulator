// ESHardInfomation.js
// ES�̃n�[�h��� - ES hard information

///////////////////////////////////////////////////////////////
// ES �֘A�̒�` - ES related definition

// DD �̃h�b�g�}�g���b�N�X�̃T�C�Y�i�V���{���͓����Ă��Ȃ��j- Size of dot matrix (symbols not included)
export const VRAMSIZE_WIDTH = 192
export const VRAMSIZE_HEIGHT = 63
export const VRAMSIZE_WIDTHDUMMY = 256

export const VRAMSIZE_LINE = (VRAMSIZE_WIDTHDUMMY/8)

// VRAM�̃h�b�g���̊J�n�ʒu - Start position of VRAM dot section
export const VRAM_DOTSTART_OFFSET = (VRAMSIZE_WIDTHDUMMY/8)

// VRAM�̃T�C�Y�i�V���{�����݁j- VRAM size (Symbol included)
export const ES_DDLEN = (((VRAMSIZE_WIDTHDUMMY/8)*(VRAMSIZE_HEIGHT+1)))

///////////////////////////////////////////////////////////////
// ES �� GUI �����̂����֘A�̒�` - Definition of interaction related to ES and GUI part

// �@��W�J����p - Judgment of expansion of varieties
export const REGISTER_MODER = 0x0f050


// �V�~�����[�^�g���p�������T�C�Y�i�V�~�����[�^��p�j�f�t�h���Ƃ̂����p - Memory size for simulator extension (simulator only) For interaction with GUI section
export const ES_U8DUMMYSIZE = 0x0100

export const TIME_WAIT = 0.125

// VRAM�̂s�n�o�A�h���X - VRAM TOP address
export const ES_DDSYMBOLADR = 0xf800
export const ES_DDTOPADR = 0xf820

// STOP(KEY)����̉�������r�b�g�̏d�� - Bit weight to cancel from stop (key)
export const STOP_KEYRELEASE_BIT = 1
// STOP(��KEY)����̉�������r�b�g�̏d�� - Bit weight to cancel from STOP (non-KEY)
export const STOP_RELEASE_BIT = 5

// ����STOP���������A�h���X - What STOP indicated address
export const ES_STOPTYPEADR = 0x048e00

// �j�h/�j�n�̕ۑ��A�h���X - KI / KO Save Address
export const ES_KIADR = 0x048e01
export const ES_KOADR = 0x048e02

// �ۑ����郆�[�U�f�[�^�̃A�h���X�ƒ��� - Address and length of user data to be saved
export const ES_USRDATA_TOPADR = 0x0D000
export const ES_USRDATA_LEN = (0x02000)	// �����RAM8K�S�ĕۑ������i�̈悪�@��ɂ���ĕς��炵���̂Łj- This time, all RAM8K saved (area seems to change depending on the model)

// �@�햼�A�o�[�W�����������Ă���ꏊ - Machine name, place where version contains
export const ES_NAME_ADR = 0x3FFEE


// ����STOP�����̃f�[�^ - What STOP Middle Data
export const ES_STOP_GETKEY = 0x01			// �L�[�҂� - Waiting for keys
export const ES_STOP_ACBREAK = 0x02			// AcBreak�`�F�b�N - ACBREAK check
export const ES_STOP_DOOFF = 0x03			// OFF
export const ES_STOP_DDOUT = 0x04			// DD �\�� - DD display
export const ES_STOP_QRCODE_IN = 0x05			// QR Ver.11 �J�n�iURL�������Ă���j- QR Ver.11 start (URL also comes in)
export const ES_STOP_QRCODE_OUT = 0x06			// QR �I�� - QR end
export const ES_STOP_QRCODE_IN3 = 0x07			// QR Ver.3  �J�n�iURL�������Ă���j- QR Ver. 3 start (URL comes in)
export const ES_STOP_ACBREAK2 = 0x08			// AcBreak�`�F�b�N	<SRC_15270_ACBreakWithDD> - ACBREAK check

export const ES_QR_DATATOP_ADR = 0x04A800			// QR����URL�������Ă��� - The URL at QR is included

// Wait�̎��Ԃ������Ă���A�h���X - Address with WAIT time
export const ES_WAIT_LADR = 0x0f020
export const ES_WAIT_UADR = 0x0f021

// ����Mode�����������f�[�^�������Ă���A�h���X - Address contains data indicating whether MODE is currently
export const ES_ISMODE_ADR = 0x080fb

// �@�햼�A�o�[�W�����������Ă���ꏊ - Machine name, place where version contains
export const ES_NAME_LEN = 6
export const ES_VERSION_ADR = (ES_NAME_ADR+ES_NAME_LEN)
export const ES_VERSION_LEN = 2
export const ES_SUM_ADR = (ES_VERSION_ADR+ES_VERSION_LEN)
export const ES_SUM_LEN = 2
export const ES_SUM_STR_LEN = (ES_SUM_LEN*2)		// ������ɂ����ꍇ�̒����isum�̓o�C�i���œ����Ă��邽�߁j - Length when it is a string (SUM is in binary)
