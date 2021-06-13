import { MDBRow, MDBContainer, MDBCol } from 'mdbreact'
import './AddParcel.css'

function AddParcel() {
    return (
        <>
        <MDBContainer className="add-parcel">
            <MDBRow>
                <MDBCol md="6">
                   <form action="">
                    <p className="h4 text-center mb-4">Add New Parcel</p>
                        <label htmlFor="defaultFormRegisterNameEx" className="grey-text">
                        Your name
                        </label>
                        <input type="text" id="defaultFormRegisterNameEx" className="form-control" />
                        <br />
                        <label htmlFor="defaultFormRegisterNameEx" className="grey-text">
                        Your name
                        </label>
                        <input type="text" id="defaultFormRegisterNameEx" className="form-control" />
                        <br />
                        <label htmlFor="defaultFormRegisterNameEx" className="grey-text">
                        Your name
                        </label>
                        <input type="text" id="defaultFormRegisterNameEx" className="form-control" />
                        <br />
                        <label htmlFor="defaultFormRegisterNameEx" className="grey-text">
                        Your name
                        </label>
                        <input type="text" id="defaultFormRegisterNameEx" className="form-control" />
                        <br />
                        <label htmlFor="defaultFormRegisterNameEx" className="grey-text">
                        Your name
                        </label>
                        <input type="text" id="defaultFormRegisterNameEx" className="form-control" />
                        <br />
                        <label htmlFor="defaultFormRegisterNameEx" className="grey-text">
                        Your name
                        </label>
                        <input type="text" id="defaultFormRegisterNameEx" className="form-control" />
                        <br />
                        
                   </form>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
        </>
    )
}

export default AddParcel
