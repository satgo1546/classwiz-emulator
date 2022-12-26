// ESHardInfomation.h
// ES�̃n�[�h���

///////////////////////////////////////////////////////////////
// ES �֘A�̒�`

// DD �̃h�b�g�}�g���b�N�X�̃T�C�Y�i�V���{���͓����Ă��Ȃ��j
export const VRAMSIZE_WIDTH = 192
export const VRAMSIZE_HEIGHT = 63
export const VRAMSIZE_WIDTHDUMMY = 256

export const VRAMSIZE_LINE = (VRAMSIZE_WIDTHDUMMY)

// VRAM�̃o�b�t�@�T�C�Y (1dot:1byte)
export const VRAM_BUF_SIZE = (VRAMSIZE_WIDTHDUMMY*(VRAMSIZE_HEIGHT+1))
// VRAM�̃h�b�g���̊J�n�ʒu
export const VRAM_DOTSTART_OFFSET = (VRAMSIZE_WIDTHDUMMY)

// DD�̃T�C�Y�i�V���{������, ���m�N��, 1dot:1bit�j
export const ES_DDLEN = (((VRAMSIZE_WIDTHDUMMY/8)*(VRAMSIZE_HEIGHT+1)))

///////////////////////////////////////////////////////////////
// ES �� GUI �����̂����֘A�̒�`

// �@��W�J����p
export const REGISTER_MODER = 0x0f050

// �V�~�����[�^�g���p�������T�C�Y�i�V�~�����[�^��p�j�f�t�h���Ƃ̂����p
export const ES_U8DUMMYSIZE = 0x0100

// Ans Copy �����o�b�t�@�T�C�Y (DispCopy_Std_asm.c ���)
// ����(1), ������(23), Dot(1), E(1), �������܂ގw����(4), �I�[(1) = 31
export const ANS_COPY_STR_BUFFSIZE = (31)

// RAMMAP.h ���
export const SADR_DoKeyMode = (0x088E00)							// STOP���[�h�w��Flag(STOPMODE_WAIT~)
export const SADR_dataKI = (0x088E01)							// �L�[�҂������ۂ�KI�̒l
export const SADR_dataKO = (0x088E02)							// �L�[�҂������ۂ�KI�̒l
export const SADR_AnsCopy = (0x088E10)							// AnsCopy����Ans��CBCD�f�[�^�����܂��̈�̃A�h���X
export const SADR_DispCopy = (0x089000)							// DispCopy����DD�̑S�̈�����܂��̈�̃A�h���X�i�璷�����͂Ȃ��j
																		// - 4�K�����DD�Ƃ��Ďg�p��
export const SADR_OTHERTOP = (0x089800)							// OtherData�̐擪�i0x0C �̕����͊܂܂Ȃ��j
export const SADR_OTHERFLAGHEAD = ((SADR_OTHERTOP + 4))			// FlagData�̃w�b�_�[����
export const SADR_OTHERFLAGDATA = ((SADR_OTHERFLAGHEAD + 4))		// FlagData�̃f�[�^�擪
export const SADR_OTHERRESULTHEAD = ((SADR_OTHERFLAGHEAD + 0x30))	// ���ʃf�[�^�w�b�_�[
export const SADR_OTHERRESULTDATA = ((SADR_OTHERRESULTHEAD + 4))		// ���ʃf�[�^�̃f�[�^�擪
export const SADR_QRTOP = (0x08A800)

export const SADR_PWCONT = (0x08B800)							// �UPWCONT(�d�����䃌�W�X�^) (1�o�C�g)
export const SADR_STACKPTR = (0x08B801)							// �X�^�b�N�|�C���^�̒l (2�o�C�g)

export const TIME_WAIT = 0.125

// VRAM�̂s�n�o�A�h���X
export const ES_DDSYMBOLADR = 0xf800
export const ES_DDTOPADR = 0xf820

// VRAM�A�h���X (4�K������)
export const ES_DD_LOWER_ADR = (0xf800)
// VRAM�A�h���X (4�K�����)
export const ES_DD_UPPER_ADR = SADR_DispCopy  // ��DispCopy�̈���g�p

// STOP(KEY)����̉�������r�b�g�̏d��
export const STOP_KEYRELEASE_BIT = 1
// STOP(��KEY)����̉�������r�b�g�̏d��
export const STOP_RELEASE_BIT = 5

// ����STOP���������A�h���X
export const ES_STOPTYPEADR = SADR_DoKeyMode

// �j�h/�j�n�̕ۑ��A�h���X
export const ES_KIADR = SADR_dataKI
export const ES_KOADR = SADR_dataKO

// RAM�̃A�h���X�ƒ���
export const ES_RAM_TOPADR = (0x09000)       // TOP
export const ES_RAM_USED_ENDADR = (0x0EFFF)       // �g�p����END (C�X�^�b�N��END)
export const ES_RAM_LEN = (24576)         // �S�̂̒���
export const ES_RAM_USED_LEN = (ES_RAM_USED_ENDADR - ES_RAM_TOPADR + 1) // �g�p���̒���

// �ۑ����郆�[�U�f�[�^�̃A�h���X�ƒ���
export const ES_USRDATA_TOPADR = (ES_RAM_TOPADR) // TOP
export const ES_USRDATA_LEN = (16384)            // TOP�`VRAM�r���܂� (0xD000 - 0x9000)

// �@�햼�A�o�[�W�����������Ă���ꏊ
export const ES_NAME_ADR = (0x71FEE)

// �X�^�b�N
export const ES_STACK_TOP = (0x0E254)
export const ES_STACK_LEN = (3500)

// ����STOP�����̃f�[�^
export const ES_STOP_GETKEY = 0x01			// �L�[�҂�
export const ES_STOP_ACBREAK = 0x02			// AcBreak�`�F�b�N
export const ES_STOP_DOOFF = 0x03			// OFF
export const ES_STOP_DDOUT = 0x04			// DD �\��
export const ES_STOP_QRCODE_IN = 0x05			// QR Ver.11 �J�n�iURL�������Ă���j
export const ES_STOP_QRCODE_OUT = 0x06			// QR �I��
export const ES_STOP_QRCODE_IN3 = 0x07			// QR Ver.3  �J�n�iURL�������Ă���j
export const ES_STOP_ACBREAK2 = 0x08			// AcBreak�`�F�b�N	<SRC_15270_ACBreakWithDD>

export const ES_QR_DATATOP_ADR = SADR_QRTOP		// QR����URL�������Ă���

// Wait�̎��Ԃ������Ă���A�h���X
export const ES_WAIT_LADR = 0x0f020
export const ES_WAIT_UADR = 0x0f021

// ����Mode�����������f�[�^�������Ă���A�h���X
export const ES_ISMODE_ADR = 0x080fb

// �@�햼�A�o�[�W�����������Ă���ꏊ
export const ES_NAME_LEN = 6
export const ES_VERSION_ADR = (ES_NAME_ADR+ES_NAME_LEN)
export const ES_VERSION_LEN = 2
export const ES_SUM_ADR = (ES_VERSION_ADR+ES_VERSION_LEN)
export const ES_SUM_LEN = 2
export const ES_SUM_STR_LEN = (ES_SUM_LEN*2)		// ������ɂ����ꍇ�̒����isum�̓o�C�i���œ����Ă��邽�߁j

// ���x�`�F�b�N�p�ݒ�
export const ADR_INPUTADR = (0x0A100)		// �f�[�^�󂯎��p�i256byte�j
export const ADR_OUTPUTADR = (0x0A200)		// �f�[�^�f���o���p�i256byte
export const ADR_PCHKWAITADR = (0x09E03)		// ���Z�I���Ď��t���O
export const ADR_PCHKWAITADR2 = (0x09E04)		// ���Z�I���Ď��t���O

export const ES_INPUTADR = ADR_INPUTADR		// ���͗p256byte
export const ES_OUTPUTADR = ADR_OUTPUTADR		// �o�͗p256byte
export const ES_PCHKWAITADR = ADR_PCHKWAITADR		// ���Z�I���Ď��t���O
export const ES_PCHKWAITADR2 = ADR_PCHKWAITADR2	// ���Z�I���Ď��t���O�Q

