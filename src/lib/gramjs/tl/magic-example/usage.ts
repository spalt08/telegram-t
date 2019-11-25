import { gramJsApi } from './gramJsApi';
import * as client from './client';

const {
  constructors: { InputPeerUser, InputPeerPhotoFileLocation, upload: uploadConstructors },
  requests: { upload },
} = gramJsApi;

// Examples of proper type matches.
// Try to uncomment wrong args and props to see that type checked is complaining.

InputPeerUser.serializeDate(new Date());

const inputPeerUser = new InputPeerUser({
  userId: 1,
  accessHash: 'some hash',
  // wrongArg: true,
});

console.log(inputPeerUser.userId);
// This property does not exist!
// console.log(inputPeerUser.wrongProp);

const inputLocation = new InputPeerPhotoFileLocation({
  // `inputPeerUser` is an instance of constructor `InputPeerUser` which is of type `InputPeer`, so it works here:
  peer: inputPeerUser,
  volumeId: 'some volume id',
  localId: 2,
  // wrongArg: true,
});

(async () => {
  // Args and return value of `clientInvoke` obtain proper types depending on request class.
  const result = await client.invoke(upload.GetFileRequest, {
    flags: 1,
    location: inputLocation,
    offset: 2,
    limit: 3,
    // wrongArg: true,
  });
  
  if (result instanceof uploadConstructors.File) {
    console.log(result.bytes);
    // console.log(result.wrongProp);
  } else {
    console.log('REDIRECT');
  }
  
})();
