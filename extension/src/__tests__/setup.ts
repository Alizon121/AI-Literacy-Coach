import "@testing-library/jest-dom";

const sendMessageMock = vi.fn();
const storageSyncGetMock = vi.fn();
const storageSyncSetMock = vi.fn();

Object.defineProperty(globalThis, "chrome", {
  value: {
    runtime: {
      sendMessage: sendMessageMock,
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
    storage: {
      sync: {
        get: storageSyncGetMock,
        set: storageSyncSetMock,
      },
    },
  },
  writable: true,
});

beforeEach(() => {
  sendMessageMock.mockReset();
  storageSyncGetMock.mockReset();
  storageSyncSetMock.mockReset();
});
