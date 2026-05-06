import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DateUtils {
    private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

    public static boolean isValidDate(String date) {
        try {
            sdf.parse(date);
            return true;
        } catch (ParseException e) {
            return false;
        }
    }

    public static boolean isDateWithinRange(String date, String startDate, String endDate) {
        try {
            Date d = sdf.parse(date);
            Date start = sdf.parse(startDate);
            Date end = sdf.parse(endDate);
            return (d.equals(start) || d.equals(end) || (d.after(start) && d.before(end)));
        } catch (ParseException e) {
            return false;
        }
    }
}
