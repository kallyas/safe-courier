import Skeleton from "react-loading-skeleton"


const RecentSkeleton = () => {

      return (
        <tr>
          <th scope="row"><Skeleton /></th>
          <td><Skeleton /></td>
          <td>
            <span className={`fw-normal text`}>
              <Skeleton />
            </span>
          </td>
          <td><Skeleton /></td>
        </tr>
      );
}

export default RecentSkeleton