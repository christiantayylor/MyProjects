@Dao
public interface ExcursionDao {
    @Insert
    void insert(Excursion excursion);

    @Update
    void update(Excursion excursion);

    @Delete
    void delete(Excursion excursion);

    @Query("SELECT * FROM excursion_table WHERE id = :excursionId LIMIT 1")
    Excursion getExcursionById(int excursionId);

    @Query("SELECT * FROM excursion_table WHERE vacationId = :vacationId ORDER BY date ASC")
    List<Excursion> getExcursionsForVacation(int vacationId);
}
